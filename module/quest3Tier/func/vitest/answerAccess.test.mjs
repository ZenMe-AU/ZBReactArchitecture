/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { describe, expect, test } from "vitest";
import { visibleAnswer, visibleAnswers } from "../handler/answerAccess.mjs";

const answers = [
  { id: "mike-answer", profileId: "mike" },
  { id: "ian-answer", profileId: "ian" },
];

describe("Q3 relationship-scoped answers", () => {
  test("the question owner sees every answer with its author", () => {
    expect(visibleAnswers("bella", "bella", answers)).toEqual(answers);
  });

  test("a respondent sees only their own answer", () => {
    expect(visibleAnswers("bella", "mike", answers)).toEqual([answers[0]]);
    expect(visibleAnswer("bella", "mike", answers[1])).toBeNull();
  });

  test("an unrelated profile sees no answers", () => {
    expect(visibleAnswers("bella", "eric", answers)).toEqual([]);
    expect(visibleAnswer("bella", "eric", answers[0])).toBeNull();
  });
});
