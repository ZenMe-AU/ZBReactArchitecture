/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
  await page.getByRole("navigation").getByRole("link", { name: "Quest 3 Tier" }).click();
  await page.getByRole("link", { name: "901c23bf-54d4-41c5-95c6-" }).click();
  await page.getByText("Follow Up").click();
  await page.getByRole("heading", { name: "Send a follow-up Question" }).click();
  await page.getByRole("main").getByRole("button").filter({ hasText: /^$/ }).click();
  await page.getByText("Select who you want to send a").click();
  await page.getByRole("textbox").click();
  await page.getByRole("checkbox", { name: "A", exact: true }).check();
  await page.getByText("A", { exact: true }).click();
  await page.getByRole("checkbox", { name: "B" }).check();
  await page.getByText("B", { exact: true }).click();
  await page.getByRole("checkbox", { name: "C (1 response)" }).check();
  await page.getByText("C", { exact: true }).click();
  await page.getByRole("button", { name: "Add" }).click();
  await page.getByText("Select a follow-up question").click();
  await page.getByText("Save Filter").click();
  await page.getByRole("checkbox", { name: "Save Filter" }).uncheck();
  await page.getByRole("button", { name: "send" }).click();
});
