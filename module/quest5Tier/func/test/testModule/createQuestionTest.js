const baseUrl = process.env.BASE_URL;
const qryUrl = new URL("/questionQry", baseUrl);
const cmdUrl = new URL("/questionCmd", baseUrl);
const { questionData, questionTestResult } = require("./createQuestionTestData");

const createQuestion = (profileIdLookup, testCorrelationId) => {
  test.each(questionData())("create question $questionId", async (q) => {
    const response = await fetch(cmdUrl + "/createQuestion", {
      headers: { "Content-Type": "application/json", "x-correlation-id": testCorrelationId },
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
  });
};

const checkQuestion = (profileIdLookup) => {
  test.each(questionTestResult())("There should be $count questions by user $userId.", async (r) => {
    const response = await fetch(qryUrl + "/getQuestions/" + profileIdLookup.getProfileId(r.userId), {
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
