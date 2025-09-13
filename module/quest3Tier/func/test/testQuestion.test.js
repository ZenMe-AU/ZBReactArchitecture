const { createUser, profileIdLookup } = require("./testModule/createUserTest");
const { createQuestion, checkQuestion, questionIdLookup } = require("./testModule/createQuestionTest");
const { createAnswer } = require("./testModule/createAnswerTest");
const { checkAnswer } = require("./testModule/createAnswerTest_B");
const { createFollowUp } = require("./testModule/createFollowUpTest");
const { checkShareQuestion, checkFollowUpQty } = require("./testModule/createFollowUpTest_B");
const { v4: uuidv4 } = require("uuid");

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
