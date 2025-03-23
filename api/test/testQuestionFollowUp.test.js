const { createUser, profileIdLookup } = require("./testModule/createUserTest");
const { createQuestion, questionIdLookup } = require("./testModule/createQuestionTest");
const { createAnswer } = require("./testModule/createAnswerTest");
const { createFollowUp } = require("./testModule/createFollowUpTest");
const { checkShareQuestion } = require("./testModule/createFollowUpTest_B");

describe("test question data", () => {
  createUser();
  createQuestion(profileIdLookup);
  createAnswer(profileIdLookup, questionIdLookup);
  createFollowUp(profileIdLookup, questionIdLookup);
  checkShareQuestion(profileIdLookup, questionIdLookup);
});
