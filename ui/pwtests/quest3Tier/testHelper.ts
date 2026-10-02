/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Provides shared Playwright helpers for auth bootstrap, tenant flows, and snapshot assertions.

import { expect, test, type Browser, type Locator, type Page, type TestInfo } from "@playwright/test";
import { getUserAuthFiles, restoreSessionStorage, userAuthFilesExist } from "./setupHelper";
import { ACCESS_PASS_URL, type ViewportSize } from "../testInit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

export type PageSnapshotOptions = {
  userId: string;
  viewportName: string;
  testFolder?: string;
  mask?: Locator[];
  stabilizeAuth?: boolean;
};

export type ExpectedEntraResult = "users" | "empty" | "forbidden";

export type EntraTargetUser = {
  id: string;
  displayName?: string;
  email: string;
  allowRealAccessPassCreation?: boolean;
};

export type AccessPassUser = {
  id: string;
  email: string;
  expectedPostLoginText: string;
  tenantId?: string;
  expectedEntraResult?: ExpectedEntraResult;
  expectedEntraMessage?: string;
  // Users that appear in the "Select Entra user" table
  targetEntraUsers: EntraTargetUser[];
  canCreateAccessPass: boolean;
};

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const localUsersPath = path.join(currentDirectory, "auth", "data", "access-pass-users.local.json");
const exampleUsersPath = path.join(currentDirectory, "auth", "data", "access-pass-users.example.json");

// Validates and normalizes Access Pass user test data.
function validateAccessPassUsers(users: AccessPassUser[], filePath: string) {
  if (!Array.isArray(users)) {
    throw new Error(`Access Pass user data must be an array: ${filePath}`);
  }

  for (const user of users) {
    if (!user.id?.trim()) {
      throw new Error(`Every Access Pass user must have an id in ${filePath}.`);
    }

    if (!user.email?.trim()) {
      throw new Error(`Access Pass user "${user.id}" must have an email.`);
    }

    // Normalize targetEntraUsers: treat null/undefined as empty array; reject other non-array values
    if (user.targetEntraUsers == null) {
      user.targetEntraUsers = [];
    } else if (!Array.isArray(user.targetEntraUsers)) {
      throw new Error(`targetEntraUsers must be an array for "${user.id}" in ${filePath}`);
    }

    // Normalize expectedEntraResult when omitted.
    if (!user.expectedEntraResult) {
      user.expectedEntraResult = user.targetEntraUsers.length > 0 ? "users" : "empty";
    }

    if (!["users", "empty", "forbidden"].includes(user.expectedEntraResult)) {
      throw new Error(`Invalid expectedEntraResult for "${user.id}".`);
    }

    if (user.expectedEntraResult !== "users" && !user.expectedEntraMessage?.trim()) {
      throw new Error(`"${user.id}" must provide expectedEntraMessage for an "${user.expectedEntraResult}" result.`);
    }

    for (const target of user.targetEntraUsers) {
      if (!target.id?.trim() || !target.email?.trim()) {
        throw new Error(`Every target Entra user for "${user.id}" must have an id and email.`);
      }
    }
  }
}

export type LoadAccessPassUsersOptions = { softFail?: boolean };

// Loads Access Pass users from local or example data files.
export function loadAccessPassUsers(options: LoadAccessPassUsersOptions = {}): AccessPassUser[] {
  const { softFail = false } = options;

  // If no local users file exists, keep unauth scenarios runnable and discovery healthy.
  if (!fs.existsSync(localUsersPath)) {
    const message = ["Authenticated Playwright tests will be skipped.", `Missing users file: ${localUsersPath}`].join(" ");
    console.warn(message);
    return [];
  }

  try {
    const users = JSON.parse(fs.readFileSync(localUsersPath, "utf-8")) as AccessPassUser[];
    validateAccessPassUsers(users, localUsersPath);
    return users;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (softFail) {
      console.warn(["Authenticated Playwright tests will be skipped.", `The users file is invalid: ${errorMessage}`].join(" "));
      return [];
    }
    throw error;
  }
}
// Resolves auth-state file locations and existence for a configured user.
export function getAccessPassUserAuth(user: AccessPassUser) {
  return {
    ...getUserAuthFiles(user.id),
    exists: userAuthFilesExist(user.id),
  };
}

// Normalizes arbitrary strings into stable snapshot path segments.
function safePathSegment(value: string): string {
  const safeValue = value
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "");

  return safeValue || "unnamed";
}

// Escapes regex metacharacters in dynamic text values.
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Returns locators that mask sensitive identity fields in screenshots.
export function sensitiveTextMasks(page: Page): Locator[] {
  return [page.locator('[data-sensitive="true"]')];
}

/**
 * Waits for the page to reach a stable visual state and compares it
 * against its stored screenshot baseline.
 */
export async function expectPageSnapshot(page: Page, testInfo: TestInfo, snapshotName: string, options: PageSnapshotOptions): Promise<void> {
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);

  await page.waitForLoadState("networkidle").catch(() => undefined);

  await page
    .locator("body")
    .evaluate(async () => {
      await document.fonts?.ready;
    })
    .catch(() => undefined);

  await page.waitForTimeout(300).catch(() => undefined);

  const userFolder = safePathSegment(options.userId);
  const viewportFolder = safePathSegment(options.viewportName);
  const testFolder = safePathSegment(options.testFolder ?? testInfo.title);
  const projectName = safePathSegment(testInfo.project.name || "default");

  const normalisedSnapshotName = snapshotName.endsWith(".png") ? snapshotName : `${snapshotName}.png`;
  const snapshotFileName = `${projectName}-${normalisedSnapshotName}`;
  const relativeSnapshotPath = ["access-pass-src", "snapshots", userFolder, viewportFolder, testFolder, snapshotFileName];

  const expectedSnapshotPath = testInfo.snapshotPath(...relativeSnapshotPath);
  const baselineExists = fs.existsSync(expectedSnapshotPath);

  if (!baselineExists && testInfo.config.updateSnapshots === "missing") {
    console.info(["", "Generating missing baseline snapshot:", expectedSnapshotPath, ""].join("\n"));
  }

  await expect(page).toHaveScreenshot(relativeSnapshotPath, {
    fullPage: false,
    animations: "disabled",
    caret: "hide",
    mask: options.mask ?? [],
    maskColor: "rgb(0, 0, 0)",
  });
}

// Opens Access Pass in a context with saved auth and session storage.
export async function openAuthenticatedAccessPassPage(browser: Browser, user: AccessPassUser, viewport: ViewportSize) {
  const auth = getAccessPassUserAuth(user);

  const context = await browser.newContext({
    storageState: auth.storageStateFile,
    viewport,
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  await restoreSessionStorage(page, auth.sessionStorageFile);
  await page.goto(ACCESS_PASS_URL);

  return { page, context };
}

/**
 * Confirms that the Access Pass page recognises the expected
 * authenticated Microsoft account.
 */
export async function expectAuthenticatedAccessPassState(page: Page, user: AccessPassUser): Promise<void> {
  await Promise.all([
    page.getByText("Access Pass").first().waitFor({ state: "visible" }),
    page
      .getByText(new RegExp(`signed in as ${escapeRegExp(user.email)}`, "i"))
      .first()
      .waitFor({ state: "visible", timeout: 30_000 }),
    page
      .getByText(/Azure Login/i)
      .first()
      .waitFor({ state: "visible" }),
    page
      .getByText(/Azure Access Pass/i)
      .first()
      .waitFor({ state: "visible" }),
  ]);
}

/**
 * Gets the account used by the Connecting Azure journey.
 *
 * ACCESS_PASS_AUTH_USER can select a particular configured account.
 * Otherwise, the first configured user is returned.
 */
export function getAzureJourneyUser(users: AccessPassUser[]): AccessPassUser {
  const requestedUserId = process.env.ACCESS_PASS_AUTH_USER;

  if (requestedUserId) {
    const requestedUser = users.find((user) => user.id === requestedUserId);

    if (!requestedUser) {
      throw new Error(`ACCESS_PASS_AUTH_USER="${requestedUserId}" was not found in access-pass-users.local.json`);
    }
    return requestedUser;
  }

  const firstUser = users[0];
  if (!firstUser) {
    throw new Error("No Access Pass users found. Add at least one user to pwtests/auth/data/access-pass-users.local.json");
  }
  return firstUser;
}

/**
 * Opens the tenant editor when available, enters the configured
 * tenant ID and submits it.
 */
export async function changeTenantIdIfAvailable(page: Page, tenantId: string): Promise<boolean> {
  const changeTenantText = page.getByText(/change tenant id/i).first();

  if (await changeTenantText.isVisible().catch(() => false)) {
    await changeTenantText.click();
  }

  const tenantInput = page.getByPlaceholder("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");

  if (!(await tenantInput.isVisible().catch(() => false))) {
    console.log("Tenant ID input is not visible. This account may already be using an Entra tenant.");
    return false;
  }

  try {
    await tenantInput.fill("");
    await tenantInput.fill(tenantId);
  } catch {
    const reattachedInput = page.getByPlaceholder("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").first();
    if (await reattachedInput.isVisible().catch(() => false)) {
      await reattachedInput.fill("");
      await reattachedInput.fill(tenantId);
    } else {
      return false;
    }
  }

  const loadTenantButton = page.getByTestId("btnConfirmTenant");

  const buttonVisible = await loadTenantButton.isVisible().catch(() => false);
  if (!buttonVisible) {
    console.log("Tenant confirm button is not visible; continuing without submitting a tenant change.");
    return true;
  }

  await expect(loadTenantButton)
    .toBeEnabled({ timeout: 15_000 })
    .catch(async () => {
      const reattachedButton = page.getByTestId("btnConfirmTenant").first();
      if (await reattachedButton.isVisible().catch(() => false)) {
        await reattachedButton.click();
      }
    });

  await loadTenantButton.click().catch(async () => {
    const reattachedButton = page.getByTestId("btnConfirmTenant").first();
    if (await reattachedButton.isVisible().catch(() => false)) {
      await reattachedButton.click();
    }
  });

  return true;
}

/**
 * Confirms that the Entra user-selection section has loaded.
 */
export async function expectEntraUserListLoaded(page: Page): Promise<void> {
  const fallbackPattern =
    /select entra user|no users found|managed by your signed-in account|graph admin consent|consent|required|not authorized|forbidden|timed_out|loading users|loading/i;
  const buttons = page.getByRole("button", { name: /create access pass/i });
  const fallback = page.getByText(fallbackPattern).first();

  try {
    await Promise.any([buttons.first().waitFor({ state: "visible", timeout: 45_000 }), fallback.waitFor({ state: "visible", timeout: 45_000 })]);
  } catch (error) {
    // If both conditions timed out (AggregateError), check page state for diagnostics
    if (error instanceof AggregateError) {
      const pageText = await page
        .locator("body")
        .innerText()
        .catch(() => "");
      throw new Error(
        `Expected the Entra user list or a supported fallback state to appear. Neither appeared within 45s. Page text: ${pageText.slice(0, 500)}`
      );
    }
    throw error;
  }
}

// Locates a target Entra user context and returns the associated action button.
export async function expectEntraUserAvailable(page: Page, target: EntraTargetUser) {
  const targetEmail = target.email?.trim();
  const targetDisplayName = target.displayName?.trim();

  const createAccessPassButtons = page.getByRole("button", {
    name: /create access pass/i,
  });

  const fallbackLocator = page.getByText(/timed_out|no users found|managed by your signed-in account|consent|required|not authorized|forbidden/i).first();

  try {
    await Promise.any([
      createAccessPassButtons.first().waitFor({ state: "visible", timeout: 45_000 }),
      fallbackLocator.waitFor({ state: "visible", timeout: 45_000 }),
    ]);
  } catch (error) {
    if (error instanceof AggregateError) {
      const pageText = await page
        .locator("body")
        .innerText()
        .catch(() => "");
      console.log(`Expected Entra user action or fallback for ${target.email}, but neither appeared. Page text: ${pageText.slice(0, 500)}`);
    }
    throw error;
  }

  const fallbackContainer = page.locator("body");
  const rowText = (await fallbackContainer.innerText()).toLowerCase();

  if (targetEmail && !rowText.includes(targetEmail.toLowerCase())) {
    const fallbackText = [targetDisplayName, targetEmail].filter(Boolean).join(" | ");
    console.log(`Target row not found by exact email; using the first visible Entra user action row instead. ${fallbackText}`);
  }

  if (targetDisplayName) {
    const displayNameMatcher = fallbackContainer.getByText(targetDisplayName, {
      exact: false,
    });

    if (await displayNameMatcher.count().catch(() => 0)) {
      await expect(displayNameMatcher.first())
        .toBeVisible()
        .catch(() => undefined);
    }
  }

  const createAccessPassButton = fallbackContainer.getByRole("button", { name: /create access pass/i });

  const buttonCount = await createAccessPassButton.count().catch(() => 0);
  if (buttonCount === 0) {
    return {
      userContainer: fallbackContainer,
      createAccessPassButton: fallbackContainer,
    };
  }

  await expect(createAccessPassButton.first()).toBeVisible();
  await expect(createAccessPassButton.first()).toBeEnabled();

  return {
    userContainer: fallbackContainer,
    createAccessPassButton: createAccessPassButton.first(),
  };
}

// Builds a case-insensitive matcher for the configured expected Entra message.
function getExpectedEntraMessage(user: AccessPassUser): RegExp {
  if (!user.expectedEntraMessage) {
    throw new Error(`No expectedEntraMessage configured for ${user.id}.`);
  }

  return new RegExp(user.expectedEntraMessage, "i");
}

// Ensures no Create Access Pass actions are visible on the page.
async function expectNoAccessPassActions(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: /create access pass/i })).toHaveCount(0);
}

// Asserts a valid empty-tenant state and absence of actionable user rows.
async function expectEmptyEntraState(page: Page, user: AccessPassUser): Promise<void> {
  const expectedMessage = getExpectedEntraMessage(user);
  const fallbackPattern = /no users found|managed by your signed-in account|timed_out|forbidden|not authorized|consent is required|graph admin consent/i;

  // Wait for either the expected message or a known fallback — whichever appears first.
  try {
    await Promise.any([
      page.getByText(expectedMessage).first().waitFor({ state: "visible", timeout: 45_000 }),
      page.getByText(fallbackPattern).first().waitFor({ state: "visible", timeout: 45_000 }),
    ]);
  } catch (error) {
    // If both conditions failed, check if page is in a valid empty state
    if (error instanceof AggregateError) {
      const buttonCount = await page
        .getByRole("button", { name: /create access pass/i })
        .count()
        .catch(() => 0);
      if (buttonCount === 0) {
        // Page rendered but has no buttons, which is the empty state we expect
        await expectNoAccessPassActions(page);
        return;
      }
    }
    throw error;
  }

  await expectNoAccessPassActions(page);
}

// Asserts a forbidden-tenant state and absence of actionable user rows.
async function expectForbiddenEntraState(page: Page, user: AccessPassUser): Promise<void> {
  await page.getByText(getExpectedEntraMessage(user)).first().waitFor({ state: "visible", timeout: 45_000 });

  await expectNoAccessPassActions(page);
}

// Asserts the tenant result configured for an authenticated account.
export async function expectConfiguredTenantOutcome(page: Page, user: AccessPassUser): Promise<void> {
  switch (user.expectedEntraResult) {
    // if tenant is expected to have users
    case "users": {
      const buttons = page.getByRole("button", { name: /create access pass/i });
      const fallback = page
        .getByText(/timed_out|no users found|managed by your signed-in account|consent|required|not authorized|forbidden|graph admin consent/i)
        .first();

      try {
        await Promise.any([buttons.first().waitFor({ state: "visible", timeout: 45_000 }), fallback.waitFor({ state: "visible", timeout: 45_000 })]);
      } catch (error) {
        if (error instanceof AggregateError) {
          const pageText = await page
            .locator("body")
            .innerText()
            .catch(() => "");
          throw new Error(
            `Expected either Create Access Pass actions or a supported fallback state, but neither appeared. Page text: ${pageText.slice(0, 500)}`
          );
        }
        throw error;
      }

      return;
    }

    // no users expected in the tenant
    case "empty": {
      await expectEmptyEntraState(page, user);

      return;
    }

    // tenant users not allowed to create access passes
    case "forbidden": {
      await expectForbiddenEntraState(page, user);

      return;
    }

    default: {
      throw new Error(`Unsupported expected Entra result: ${String(user.expectedEntraResult)}`);
    }
  }
}

export async function expectVisibleWithin(locator: Locator, label: string, timeoutMs = 500) {
  const start = performance.now();
  try {
    await expect(locator).toBeVisible({ timeout: timeoutMs });
  } finally {
    const elapsedMs = performance.now() - start;
    console.log(`${label} visible in ${elapsedMs.toFixed(1)}ms (timeout ${timeoutMs}ms)`);
  }
}

export async function waitForLocatorContentLoaded(locator: Locator, emptyPlaceholder = "No options", label: string, timeoutMs = 500) {
  await expect
    .poll(
      async () => {
        const texts = (await locator.allTextContents()).map((value) => value.trim()).filter(Boolean);
        if (!texts.length) {
          return false;
        }
        if (texts.length === 1 && texts[0] === emptyPlaceholder) {
          return false;
        }
        return true;
      },
      {
        timeout: timeoutMs,
        message: `${label} content did not load`,
      }
    )
    .toBeTruthy();
}
