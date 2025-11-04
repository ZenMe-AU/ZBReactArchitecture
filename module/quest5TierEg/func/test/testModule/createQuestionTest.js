/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const baseUrl = process.env.BASE_URL;
console.log(" Base URL:", baseUrl);
const qryUrl = new URL("/questionQry", baseUrl);
const cmdUrl = new URL("/questionCmd", baseUrl);
const { questionData, questionTestResult } = require("./createQuestionTestData");
const { getMessageById } = require("../receiveMessages");
const funcMetaData = require("../../funcMetaData");

const funcClientFactory = require("../../funcClient/factory.js");
// class fakeHttp.fetch(functionName, headers, method, body)

const createQuestion = (profileIdLookup, testCorrelationId) => {
  let client = funcClientFactory.getClient();
  test.each(questionData())("create question $questionId", async (q) => {
    const response = await client.fetch(cmdUrl + "/createQuestion", {
      headers: { "Content-Type": "application/json", "x-correlation-id": testCorrelationId },
      method: "POST",
      body: JSON.stringify({
        profileId: profileIdLookup.getProfileId(q.userId),
        title: q.title,
        questionText: q.question,
        option: q.option,
      }),
    });
    //
    let question = await response.json();
    let messageId = question.return.messageId;
    let messageBody = await getMessageById(funcMetaData.allFunctions.CreateQuestionCmd.eventQueueName, messageId);

    let questionId = messageBody ? messageBody.data.aggregateId : null;
    questionIdLookup.add(q.questionId, questionId);
    console.log(questionIdLookup.data);

    // console.log(" Removed messages:", { removed });
    expect(response.ok).toBeTruthy();
  });
  // // TODO: listen on queue and add responses to questionIdLookUp
  // let questionId = question.return.id;
  // questionIdLookup.add(q.questionId, questionId);
};

const checkQuestion = (profileIdLookup) => {
  let client = funcClientFactory.getClient();
  test.each(questionTestResult())(
    "There should be $count questions by user $userId.",
    async (r) => {
      const response = await client.fetch(qryUrl + "/getQuestions/" + profileIdLookup.getProfileId(r.userId), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      const resultData = await response.json();
      const qty = resultData.return.list.length;
      expect(qty).toBe(r.count);
    },
    6000
  );
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

module.exports = {
  createQuestion,
  checkQuestion,
  questionIdLookup,
};
