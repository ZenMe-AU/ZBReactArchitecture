/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.locator("div").first().click();
  await page.getByText("Pick an accountNot").click();
  await page.getByRole("heading", { name: "Pick an account" }).click();
  await page.locator("div").nth(3).click();
  await page.getByText("Not available").click();
  await page.getByTestId("LoginIcon").locator("path").click();
  await page.getByRole("button", { name: "Another Microsoft Account" }).click();
});
