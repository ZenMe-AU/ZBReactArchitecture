# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quest3Tier\createQuestion.spec.ts >> test
- Location: pwtests\quest3Tier\createQuestion.spec.ts:8:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('navigation').getByRole('link', { name: 'Home' })

```

# Test source

```ts
  1  | /**
  2  |  * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
  3  |  * @license SPDX-License-Identifier: MIT
  4  |  */
  5  | 
  6  | import { test, expect } from "@playwright/test";
  7  | 
  8  | test("test", async ({ page }) => {
> 9  |   await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
     |                                                                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  10 |   await page.getByRole("navigation").getByRole("link", { name: "Quest 3 Tier" }).click();
  11 |   await page.getByRole("paragraph").click();
  12 |   await page.getByRole("heading", { name: "Add Question" }).click();
  13 |   await page.getByRole("main").getByRole("button").filter({ hasText: /^$/ }).click();
  14 |   await page.getByRole("textbox", { name: "Title" }).click();
  15 |   await page
  16 |     .locator("div")
  17 |     .filter({ hasText: /^Question$/ })
  18 |     .click();
  19 |   await page.getByRole("heading", { name: "Options:" }).click();
  20 |   await page.getByRole("textbox", { name: "New Option" }).click();
  21 |   await page.getByRole("button", { name: "Add" }).click();
  22 |   await page.getByRole("button", { name: "Submit" }).click();
  23 | });
  24 | 
```