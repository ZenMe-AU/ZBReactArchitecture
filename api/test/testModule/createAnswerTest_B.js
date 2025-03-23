const baseUrl = process.env.BASE_URL || "http://localhost:7071";
const questionUrl = new URL("/api/question", baseUrl);
const loginUrl = new URL("/api/auth/login", baseUrl);

const checkAnswer = (profileIdLookup, questionIdLookup) => {
  test.each(getAnswerTestResult())("There should be $count answers for question $question_id.", async (r) => {
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
    const response = await fetch(questionUrl + "/" + questionIdLookup.getQuestionId(r.question_id) + "/answer", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
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
      question_id: 1,
      count: 20,
    },
    {
      question_id: 2,
      count: 20,
    },
    {
      question_id: 3,
      count: 20,
    },
    {
      question_id: 4,
      count: 20,
    },
    {
      question_id: 5,
      count: 20,
    },
    {
      question_id: 6,
      count: 20,
    },
  ];
}

module.exports = { checkAnswer };
