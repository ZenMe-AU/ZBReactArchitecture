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

const shareQuestion = (profileIdLookup, questionIdLookup, testCorrelationId) => {
  let client = funcClientFactory.getClient();
  test("share question", async () => {
    let allData = questionData();
    let question = allData[5];
    const questionId = questionIdLookup.getQuestionId(question.questionId);
    const profileId = profileIdLookup.getProfileId(question.userId);

    const response = await client.fetch(cmdUrl + "/shareQuestion", {
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": testCorrelationId,
      },
      method: "POST",
      body: JSON.stringify({
        profileId,
        newQuestionId: questionId,
        // receiverIds: profileIdLookup.data.map((p) => p.profileId).filter((p) => p !== profileId),
        receiverIds: [profileIdLookup.getProfileId(2)],
      }),
    });
    expect(response.ok).toBeTruthy();
  });
};

module.exports = {
  shareQuestion,
};
