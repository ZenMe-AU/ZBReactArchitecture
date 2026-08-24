/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
  await page.getByRole("navigation").getByRole("link", { name: "Quest 3 Tier" }).click();
  await page.getByRole("paragraph").click();
  await page.getByRole("heading", { name: "Add Question" }).click();
  await page.getByRole("main").getByRole("button").filter({ hasText: /^$/ }).click();
  await page.getByRole("textbox", { name: "Title" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Question$/ })
    .click();
  await page.getByRole("heading", { name: "Options:" }).click();
  await page.getByRole("textbox", { name: "New Option" }).click();
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByRole("button", { name: "Submit" }).click();
});
