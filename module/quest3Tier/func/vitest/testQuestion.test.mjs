/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { describe, test, expect, beforeAll } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { createUser, profileIdLookup } from "./testModule/createUserTest.mjs";
import { createQuestion, checkQuestion, questionIdLookup } from "./testModule/createQuestionTest.mjs";
import { createAnswer } from "./testModule/createAnswerTest.mjs";
import { checkAnswer } from "./testModule/createAnswerTest_B.mjs";
import { createFollowUp } from "./testModule/createFollowUpTest.mjs";
import { checkShareQuestion, checkFollowUpQty } from "./testModule/createFollowUpTest_B.mjs";

const testCorrelationId = uuidv4();

describe("test question data", () => {
  beforeAll(() => {
    // Runs exactly once before any test in this file begins
    console.log("Pre-test global state configured.");
    // TODO: Add AssertDependencies test to confirm the environment is ready for the test to run.Add
    createUser();
  });

  describe("create questions", () => {
    createQuestion(profileIdLookup);
    checkQuestion(profileIdLookup);
  });

  describe("create answers", () => {
    createAnswer(profileIdLookup, questionIdLookup);
    checkAnswer(profileIdLookup, questionIdLookup);
  });

  // describe("create follow-ups", () => {
  // createFollowUp(profileIdLookup, questionIdLookup, testCorrelationId);
  // checkShareQuestion(profileIdLookup, testCorrelationId);
  // checkFollowUpQty(testCorrelationId);
  // });
});
