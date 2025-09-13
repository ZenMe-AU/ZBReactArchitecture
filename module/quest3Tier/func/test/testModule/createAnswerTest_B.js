const baseUrl = process.env.QUESTION_URL;
const questionUrl = new URL("/question", baseUrl);
const { generateToken } = require("../../service/authUtils");

const checkAnswer = (profileIdLookup, questionIdLookup) => {
  test.each(getAnswerTestResult())("There should be $count answers for question $questionId.", async (r) => {
    if (!tokenLookup.data) {
      const token = generateToken({ profileId: profileIdLookup.data[0].profileId });
      console.log("Profile ID: ", profileIdLookup.data[0].profileId);
      console.log("Generated Token: ", token);
      tokenLookup.add(token);
    }
    // console.log(tokenLookup.data);
    const response = await fetch(questionUrl + "/" + questionIdLookup.getQuestionId(r.questionId) + "/answer", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + tokenLookup.data,
      },
    });
    const resultData = await response.json();
    const qty = resultData.return.list.length;
    expect(qty).toBe(r.count);
  });
};

const tokenLookup = {
  data: null,
  add: function (token) {
    this.data = token;
  },
};

function getAnswerTestResult() {
  return [
    {
      questionId: 1,
      count: 20,
    },
    {
      questionId: 2,
      count: 20,
    },
    {
      questionId: 3,
      count: 20,
    },
    {
      questionId: 4,
      count: 20,
    },
    {
      questionId: 5,
      count: 20,
    },
    {
      questionId: 6,
      count: 20,
    },
  ];
}

module.exports = { checkAnswer };
