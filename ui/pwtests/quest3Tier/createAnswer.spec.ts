/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
  await page.getByRole("navigation").getByRole("link", { name: "Quest 3 Tier" }).click();
  await page.getByRole("link", { name: "901c23bf-54d4-41c5-95c6-" }).click();
  await page.getByText("Answer", { exact: true }).click();
  await page.getByRole("heading", { name: "Test Question" }).click();
  await page.getByRole("main").getByRole("button").filter({ hasText: /^$/ }).click();
  await page.getByText("Test context").click();
  await page.getByText("choose your answer").click();
  await page.getByRole("radio", { name: "A" }).check();
  await page.getByText("A", { exact: true }).click();
  await page.getByRole("radio", { name: "B" }).check();
  await page.getByRole("radiogroup").getByText("B").click();
  await page.getByRole("radio", { name: "C" }).check();
  await page.getByText("C", { exact: true }).click();
  await page.getByRole("button", { name: "Submit Answer" }).click();
  await page.getByRole("link", { name: "Follow Up" }).click();
});
