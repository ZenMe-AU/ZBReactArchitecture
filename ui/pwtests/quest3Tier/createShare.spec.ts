/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
  await page.getByRole("navigation").getByRole("link", { name: "Quest 3 Tier" }).click();
  await page.getByRole("link", { name: "901c23bf-54d4-41c5-95c6-" }).click();
  await page.getByText("Share").click();
  await page.getByRole("heading", { name: "Share Question" }).click();
  await page.locator("button").nth(2).click();
  await page
    .locator("div")
    .filter({ hasText: /^Select Friends$/ })
    .click();
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Share" }).click();
});
