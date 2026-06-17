/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { createUser, profileIdLookup } from "./testModule/createUserTest.mjs";
import { createQuestion, checkQuestion, questionIdLookup } from "./testModule/createQuestionTest.mjs";
import { createAnswer } from "./testModule/createAnswerTest.mjs";
import { checkAnswer } from "./testModule/createAnswerTest_B.mjs";
import { createFollowUp } from "./testModule/createFollowUpTest.mjs";
import { checkShareQuestion, checkFollowUpQty } from "./testModule/createFollowUpTest_B.mjs";
import { v4 as uuidv4 } from "uuid";
import { describe } from "@jest/globals";

const testCorrelationId = uuidv4();
describe("test question data", () => {
  createUser();
  createQuestion(profileIdLookup);
  createAnswer(profileIdLookup, questionIdLookup);
  checkQuestion(profileIdLookup);
  checkAnswer(profileIdLookup, questionIdLookup);
  createFollowUp(profileIdLookup, questionIdLookup, testCorrelationId);
  // checkShareQuestion(profileIdLookup, testCorrelationId);
  checkFollowUpQty(testCorrelationId);
});
