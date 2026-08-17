/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// run this from workspace root
// pnpm exec playwright test azure-passkey.setup.ts --project=chromium --headed --workers=1

/*
      Complete Microsoft login manually.

      Important:
      - Use passkey.
      - Click "Yes" on Stay signed in.
      - Wait until you return to Access Pass.
      - Confirm "Signed in as <UPN>" is visible.
      - Then click Resume in Playwright Inspector.
    */

import { expect, test as setup } from "@playwright/test";
import fs from "fs";
import { authDir, saveSessionStorage } from "../authState.js";
import { getAccessPassUserAuth, loadAccessPassUsers } from "../testHelper.js";

const ACCESS_PASS_URL = "http://localhost:5173/accessPass.html";

const allUsers = loadAccessPassUsers();
const requestedUserId = process.env.ACCESS_PASS_AUTH_USER?.trim();
const users = requestedUserId ? allUsers.filter((user) => user.id === requestedUserId) : allUsers;

if (requestedUserId && users.length === 0) {
  throw new Error(`ACCESS_PASS_AUTH_USER="${requestedUserId}" was not found in access-pass-users.local.json`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

for (const user of users) {
  setup(`Manual Microsoft passkey login  ${user.id}`, async ({ page }) => {
    fs.mkdirSync(authDir, { recursive: true });

    const auth = getAccessPassUserAuth(user);

    if (auth.exists) {
      console.log("Azure auth state already exists. Skipping manual passkey login.");
      console.log(`Saved storage state: ${auth.storageStateFile}`);
      console.log(`Saved session storage: ${auth.sessionStorageFile}`);
      return;
    }

    await page.goto(ACCESS_PASS_URL);

    const connectAzureButton = page.getByRole("button", {
      name: /connect azure/i,
    });

    await expect(connectAzureButton).toBeVisible();
    await connectAzureButton.click();

    /*
      Complete Microsoft login manually.

      Important:
      - Use passkey.
      - Click "Yes" on Stay signed in.
      - Wait until you return to Access Pass.
      - Confirm "Signed in as <UPN>" is visible.
      - Then click Resume in Playwright Inspector.
    */
    await page.pause();

    try {
      await page.waitForURL(/localhost:5173\/accessPass\.html(?:[/?#].*)?$/i, { timeout: 180_000 });
    } catch {
      console.log("Page did not return to Access Pass yet.");
      console.log(`Current URL: ${page.url()}`);

      if (page.url().startsWith("http://localhost:5173")) {
        await page
          .goto(ACCESS_PASS_URL, {
            waitUntil: "domcontentloaded",
            timeout: 30_000,
          })
          .catch((err) => {
            console.log(`Fallback navigation was skipped: ${err.message}`);
          });
      }
    }

    if (!page.url().includes("accessPass.html")) {
      await page.waitForLoadState("domcontentloaded").catch(() => undefined);
    }

    await expect(page.getByText(new RegExp(`signed in as ${escapeRegExp(user.email)}`, "i")).first()).toBeVisible({
      timeout: 120_000,
    });

    await page.context().storageState({ path: auth.storageStateFile });
    await saveSessionStorage(page, auth.sessionStorageFile);

    console.log(`Saved storage state: ${auth.storageStateFile}`);
    console.log(`Saved session storage: ${auth.sessionStorageFile}`);
  });
}
