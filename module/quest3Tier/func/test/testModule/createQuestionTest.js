const baseUrl = process.env.QUESTION_URL;
const questionUrl = new URL("/question", baseUrl);
const questionProfileUrl = new URL("/profile", baseUrl);
const { questionData, questionTestResult } = require("./createQuestionTestData");

const createQuestion = (profileIdLookup) => {
  test.each(questionData())(
    "create question $questionId",
    async (q) => {
      const response = await fetch(questionUrl, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          profileId: profileIdLookup.getProfileId(q.userId),
          title: q.title,
          questionText: q.question,
          option: q.option,
        }),
      });

      let question = await response.json();
      let questionId = question.return.id;
      questionIdLookup.add(q.questionId, questionId);

      expect(response.ok).toBeTruthy();
    },
    10000
  );
};

const checkQuestion = (profileIdLookup) => {
  test.each(questionTestResult())("There should be $count questions by user $userId.", async (r) => {
    const response = await fetch(questionProfileUrl + "/" + profileIdLookup.getProfileId(r.userId) + "/question", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    const resultData = await response.json();
    const qty = resultData.return.list.length;
    expect(qty).toBe(r.count);
  });
};

const questionIdLookup = {
  data: [],
  add: function (testId, questionId) {
    this.data.push({
      testId: testId,
      questionId: questionId,
    });
  },
  getQuestionId: function (id) {
    let obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.questionId : null;
  },
};

module.exports = { createQuestion, checkQuestion, questionIdLookup };
