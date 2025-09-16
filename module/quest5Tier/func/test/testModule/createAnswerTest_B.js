const baseUrl = process.env.BASE_URL;
const profileBaseUrl = process.env.PROFILE_URL || "http://localhost:7072";
const questionUrl = new URL("/question", baseUrl);
const loginUrl = new URL("/auth/login", profileBaseUrl);
const qryUrl = new URL("/questionQry", baseUrl);
const cmdUrl = new URL("/questionCmd", baseUrl);

const checkAnswer = (profileIdLookup, questionIdLookup) => {
  test.each(getAnswerTestResult())("There should be $count answers for question $questionId.", async (r) => {
    if (!tokenLookup.data) {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          userId: profileIdLookup.data[0].profileId,
        }),
      });
      const resultData = await response.json();
      tokenLookup.add(resultData.return.token);
    }
    // console.log(tokenLookup.data);
    const response = await fetch(qryUrl + "/getAnswers/" + questionIdLookup.getQuestionId(r.questionId), {
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
