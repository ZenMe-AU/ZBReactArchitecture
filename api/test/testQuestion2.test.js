//npm run test:local testQuestion2
//npm run test:prod testQuestion2
const { createUser, profileIdLookup } = require("./testModule/createUserTest");
const { createQuestion, checkQuestion, questionIdLookup } = require("./testModule/createQuestionTest");
const { createAnswer } = require("./testModule/createAnswerTest");
const { checkAnswer } = require("./testModule/createAnswerTest_B");

describe("test question data", () => {
  createUser();
  createQuestion(profileIdLookup);
  createAnswer(profileIdLookup, questionIdLookup);
  checkQuestion(profileIdLookup);
  checkAnswer(profileIdLookup, questionIdLookup);
});
