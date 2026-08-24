# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quest3Tier\updateQuestion.spec.ts >> test
- Location: pwtests\quest3Tier\updateQuestion.spec.ts:9:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Home')
Expected: visible
Timeout: 1000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 1000ms
  - waiting for getByText('Home')

```

# Test source

```ts
  402 |   if (!user.expectedEntraMessage) {
  403 |     throw new Error(`No expectedEntraMessage configured for ${user.id}.`);
  404 |   }
  405 | 
  406 |   return new RegExp(user.expectedEntraMessage, "i");
  407 | }
  408 | 
  409 | // Ensures no Create Access Pass actions are visible on the page.
  410 | async function expectNoAccessPassActions(page: Page): Promise<void> {
  411 |   await expect(page.getByRole("button", { name: /create access pass/i })).toHaveCount(0);
  412 | }
  413 | 
  414 | // Asserts a valid empty-tenant state and absence of actionable user rows.
  415 | async function expectEmptyEntraState(page: Page, user: AccessPassUser): Promise<void> {
  416 |   const expectedMessage = getExpectedEntraMessage(user);
  417 |   const fallbackPattern = /no users found|managed by your signed-in account|timed_out|forbidden|not authorized|consent is required|graph admin consent/i;
  418 | 
  419 |   // Wait for either the expected message or a known fallback — whichever appears first.
  420 |   try {
  421 |     await Promise.any([
  422 |       page.getByText(expectedMessage).first().waitFor({ state: "visible", timeout: 45_000 }),
  423 |       page.getByText(fallbackPattern).first().waitFor({ state: "visible", timeout: 45_000 }),
  424 |     ]);
  425 |   } catch (error) {
  426 |     // If both conditions failed, check if page is in a valid empty state
  427 |     if (error instanceof AggregateError) {
  428 |       const buttonCount = await page
  429 |         .getByRole("button", { name: /create access pass/i })
  430 |         .count()
  431 |         .catch(() => 0);
  432 |       if (buttonCount === 0) {
  433 |         // Page rendered but has no buttons, which is the empty state we expect
  434 |         await expectNoAccessPassActions(page);
  435 |         return;
  436 |       }
  437 |     }
  438 |     throw error;
  439 |   }
  440 | 
  441 |   await expectNoAccessPassActions(page);
  442 | }
  443 | 
  444 | // Asserts a forbidden-tenant state and absence of actionable user rows.
  445 | async function expectForbiddenEntraState(page: Page, user: AccessPassUser): Promise<void> {
  446 |   await page.getByText(getExpectedEntraMessage(user)).first().waitFor({ state: "visible", timeout: 45_000 });
  447 | 
  448 |   await expectNoAccessPassActions(page);
  449 | }
  450 | 
  451 | // Asserts the tenant result configured for an authenticated account.
  452 | export async function expectConfiguredTenantOutcome(page: Page, user: AccessPassUser): Promise<void> {
  453 |   switch (user.expectedEntraResult) {
  454 |     // if tenant is expected to have users
  455 |     case "users": {
  456 |       const buttons = page.getByRole("button", { name: /create access pass/i });
  457 |       const fallback = page
  458 |         .getByText(/timed_out|no users found|managed by your signed-in account|consent|required|not authorized|forbidden|graph admin consent/i)
  459 |         .first();
  460 | 
  461 |       try {
  462 |         await Promise.any([buttons.first().waitFor({ state: "visible", timeout: 45_000 }), fallback.waitFor({ state: "visible", timeout: 45_000 })]);
  463 |       } catch (error) {
  464 |         if (error instanceof AggregateError) {
  465 |           const pageText = await page
  466 |             .locator("body")
  467 |             .innerText()
  468 |             .catch(() => "");
  469 |           throw new Error(
  470 |             `Expected either Create Access Pass actions or a supported fallback state, but neither appeared. Page text: ${pageText.slice(0, 500)}`
  471 |           );
  472 |         }
  473 |         throw error;
  474 |       }
  475 | 
  476 |       return;
  477 |     }
  478 | 
  479 |     // no users expected in the tenant
  480 |     case "empty": {
  481 |       await expectEmptyEntraState(page, user);
  482 | 
  483 |       return;
  484 |     }
  485 | 
  486 |     // tenant users not allowed to create access passes
  487 |     case "forbidden": {
  488 |       await expectForbiddenEntraState(page, user);
  489 | 
  490 |       return;
  491 |     }
  492 | 
  493 |     default: {
  494 |       throw new Error(`Unsupported expected Entra result: ${String(user.expectedEntraResult)}`);
  495 |     }
  496 |   }
  497 | }
  498 | 
  499 | export async function expectVisibleWithin(locator: Locator, label: string, timeoutMs = 500) {
  500 |   const start = performance.now();
  501 |   try {
> 502 |     await expect(locator).toBeVisible({ timeout: timeoutMs });
      |                           ^ Error: expect(locator).toBeVisible() failed
  503 |   } finally {
  504 |     const elapsedMs = performance.now() - start;
  505 |     console.log(`${label} visible in ${elapsedMs.toFixed(1)}ms (timeout ${timeoutMs}ms)`);
  506 |   }
  507 | }
  508 | 
  509 | export async function waitForLocatorContentLoaded(locator: Locator, emptyPlaceholder = "No options", label: string, timeoutMs = 500) {
  510 |   await expect
  511 |     .poll(
  512 |       async () => {
  513 |         const texts = (await locator.allTextContents()).map((value) => value.trim()).filter(Boolean);
  514 |         if (!texts.length) {
  515 |           return false;
  516 |         }
  517 |         if (texts.length === 1 && texts[0] === emptyPlaceholder) {
  518 |           return false;
  519 |         }
  520 |         return true;
  521 |       },
  522 |       {
  523 |         timeout: timeoutMs,
  524 |         message: `${label} content did not load`,
  525 |       }
  526 |     )
  527 |     .toBeTruthy();
  528 | }
  529 | 
```