/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { createUser, profileIdLookup } = require("./testModule/createUserTest.mjs");
const { createQuestion, checkQuestion, questionIdLookup } = require("./testModule/createQuestionTest.mjs");
const { createAnswer } = require("./testModule/createAnswerTest.mjs");
const { checkAnswer } = require("./testModule/createAnswerTest_B.mjs");
const { createFollowUp } = require("./testModule/createFollowUpTest.mjs");
const { checkShareQuestion, checkFollowUpQty } = require("./testModule/createFollowUpTest_B.mjs");
const { uuidv4 } = require("uuid");
const { describe } = require("@jest/globals");

const testCorrelationId = uuidv4();
describe("test question data", () => {
  createUser();
  createQuestion(profileIdLookup);
  // createAnswer(profileIdLookup, questionIdLookup);
  // checkQuestion(profileIdLookup);
  // checkAnswer(profileIdLookup, questionIdLookup);
  // createFollowUp(profileIdLookup, questionIdLookup, testCorrelationId);
  // checkShareQuestion(profileIdLookup, testCorrelationId);
  // checkFollowUpQty(testCorrelationId);
});
