const { createUser, profileIdLookup } = require("./testModule/createUserTest");
const { createQuestion, questionIdLookup } = require("./testModule/createQuestionTest");
const { createAnswer } = require("./testModule/createAnswerTest");
const { checkQuestion } = require("./testModule/createQuestionTest_B");
const { checkAnswer } = require("./testModule/createAnswerTest_B");

describe("test question data", () => {
  createUser();
  createQuestion(profileIdLookup);
  createAnswer(profileIdLookup, questionIdLookup);
  checkQuestion(profileIdLookup);
  checkAnswer(profileIdLookup, questionIdLookup);
});
