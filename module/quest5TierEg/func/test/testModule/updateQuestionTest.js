/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const baseUrl = process.env.BASE_URL;
console.log(" Base URL:", baseUrl);
const qryUrl = new URL("/questionQry", baseUrl);
const cmdUrl = new URL("/questionCmd", baseUrl);
const { questionData } = require("./createQuestionTestData.js");
// const { getMessageById } = require("../receiveMessages.js");
// const funcMetaData = require("../../funcMetaData.js");

const funcClientFactory = require("../../funcClient/factory.js");
// class fakeHttp.fetch(functionName, headers, method, body)

const updateQuestion = (profileIdLookup, questionIdLookup, testCorrelationId) => {
  let client = funcClientFactory.getClient();
  test("update question", async () => {
    let allData = questionData();
    let question = allData[0];
    const questionId = questionIdLookup.getQuestionId(question.questionId);
    const profileId = profileIdLookup.getProfileId(question.userId);
    const newTitle = "Updated Title";
    const response = await client.fetch(cmdUrl + "/updateQuestion/" + questionId, {
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": testCorrelationId,
        "x-profile-id": profileId,
      },
      method: "POST",
      body: JSON.stringify([
        {
          op: "replace",
          path: "/title",
          value: newTitle,
        },
      ]),
    });
    const getResponse = await client.fetch(qryUrl + "/getQuestion/" + questionId, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
    const getResultData = await getResponse.json();
    expect(response.ok).toBeTruthy();
    expect(getResultData.return.detail.title).toBe(newTitle);
  });
};

module.exports = {
  updateQuestion,
};
