/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.getByRole("paragraph").click();
  await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
  await page.getByRole("heading", { name: "Question List" }).click();
  await page.getByRole("link", { name: "+ Add Question" }).click();
  await page.getByRole("link", { name: "Test Question Edit Share" }).click();
  await page.getByRole("link", { name: "Edit", exact: true }).click();
  await page.getByRole("link", { name: "Share", exact: true }).click();
});
