/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// npx jest ./test/testQuestion.test.js --coverage --collectCoverageFrom="**/*.js"

const { createUser, profileIdLookup } = require("./testModule/createUserTest");
const { createQuestion, checkQuestion, questionIdLookup } = require("./testModule/createQuestionTest");
const { createAnswer } = require("./testModule/createAnswerTest");
const { checkAnswer } = require("./testModule/createAnswerTest_B");
const { createFollowUp } = require("./testModule/createFollowUpTest");
const { checkShareQuestion, checkFollowUpQty } = require("./testModule/createFollowUpTest_B");
const { v4: uuidv4 } = require("uuid");
const { registerListener } = require("./receiveMessages.js");
const { updateQuestion } = require("./testModule/updateQuestionTest");
const { shareQuestion } = require("./testModule/shareQuestionTest");
const funcMetaData = global._funcMetaData || (global._funcMetaData = require("../funcMetaData"));
require("../index");

const testCorrelationId = uuidv4();

describe("test question data", () => {
  createUser();
  createQuestion(profileIdLookup, testCorrelationId);
  updateQuestion(profileIdLookup, questionIdLookup, testCorrelationId);
  shareQuestion(profileIdLookup, questionIdLookup, testCorrelationId);
  createAnswer(profileIdLookup, questionIdLookup, testCorrelationId);
  checkQuestion(profileIdLookup);
  checkAnswer(profileIdLookup, questionIdLookup);
  createFollowUp(profileIdLookup, questionIdLookup, testCorrelationId);
  checkShareQuestion(profileIdLookup, testCorrelationId);
  checkFollowUpQty(testCorrelationId);
});

beforeAll(() => {
  registerListener([
    funcMetaData.allFunctions.CreateQuestionCmd.subscriptionFilter,
    funcMetaData.allFunctions.UpdateQuestionCmd.subscriptionFilter,
    funcMetaData.allFunctions.CreateAnswerCmd.subscriptionFilter,
    funcMetaData.allFunctions.SendFollowUpCmd.subscriptionFilter,
    funcMetaData.allFunctions.ShareQuestionCmd.subscriptionFilter,
    funcMetaData.allFunctions.CreateQuestionCmd.eventQueueName,
  ]);
});
