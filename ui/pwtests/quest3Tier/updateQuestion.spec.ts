/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { test, expect } from "@playwright/test";
import { expectVisibleWithin, corpGithubAuthStateExists, restoreCorpSessionStorage, storageStateFile } from "./testHelper";
import { CORP_URL, viewports } from "../testInit";

for (const [viewportName, viewport] of Object.entries(viewports)) {
  test.describe(`Live Tests - ${viewportName}`, () => {
    test.use({ viewport, deviceScaleFactor: 1, storageState: storageStateFile });
    // test.skip(!corpGithubAuthStateExists(), "Run pwtests/corp-src/setup/github-pat-login.setup.ts first.",);
    test.skip(process.env.TEST_MODE !== "live", "Set TEST_MODE=true to run live tests.");

    test.beforeEach(async ({ page, context }) => {
      await restoreCorpSessionStorage(context);
      await page.goto(CORP_URL);
    });

    test("test", async ({ page }) => {
      await expectVisibleWithin(page.getByText("Home"), "Home", 1000);
      await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
      await page.getByRole("navigation").getByRole("link", { name: "Quest 3 Tier" }).click();
      await page.getByRole("link", { name: "901c23bf-54d4-41c5-95c6-" }).click();
      await page.getByText("Add", { exact: true }).click();
      await page.getByRole("heading", { name: "Add Question" }).click();
      await page.locator("button").nth(2).click();
      await page.getByRole("heading", { name: "Title" }).click();
      await page.getByText("Test Question").click();
      await page.locator("button").nth(3).click();
      await page.getByRole("heading", { name: "Question Text" }).click();
      await page.getByText("Test context").click();
      await page.locator("button").nth(4).click();
      await page.getByRole("heading", { name: "Options" }).click();
      await page.getByRole("heading", { name: "Options" }).locator("button").click();
      await page.getByRole("listitem").filter({ hasText: /^A$/ }).click();
      await page.getByRole("listitem").filter({ hasText: /^B$/ }).click();
      await page.getByRole("listitem").filter({ hasText: /^C$/ }).click();
    });
  });
}
