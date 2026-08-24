# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quest3Tier\questionList.spec.ts >> test
- Location: pwtests\quest3Tier\questionList.spec.ts:8:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
Call log:
  - navigating to "http://localhost:5173/login", waiting until "load"

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
> 9  |   await page.goto("http://localhost:5173/login");
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/login
  10 |   await page.getByRole("paragraph").click();
  11 |   await page.getByRole("navigation").getByRole("link", { name: "Home" }).click();
  12 |   await page.getByRole("heading", { name: "Question List" }).click();
  13 |   await page.getByRole("link", { name: "+ Add Question" }).click();
  14 |   await page.getByRole("link", { name: "Test Question Edit Share" }).click();
  15 |   await page.getByRole("link", { name: "Edit", exact: true }).click();
  16 |   await page.getByRole("link", { name: "Share", exact: true }).click();
  17 | });
  18 | 
```