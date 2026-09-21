/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { createRequire } from "module";
import { questionData, questionTestResult } from "./createQuestionTestData.mjs";
import { test, expect } from "vitest";

const require = createRequire(import.meta.url);
const { getMessageById, removeMessagesByIds } = require("../../test/receiveMessages");
const { qNameQuestionCreatedEvent } = require("../../serviceBus/queueNameList");
const baseUrl = process.env.BASE_URL;
const qryUrl = new URL("/questionQry", baseUrl);
const cmdUrl = new URL("/questionCmd", baseUrl);

export function createQuestion(profileIdLookup, testCorrelationId) {
  test.each(questionData())("create question $questionId", async (q) => {
    const response = await fetch(cmdUrl + "/createQuestion", {
      headers: { "Content-Type": "application/json", "x-correlation-id": testCorrelationId },
      // headers: { "Content-Type": "application/json", authorization: `Bearer ${profileIdLookup.getAuthToken(q.userId)}` },
      method: "POST",
      body: JSON.stringify({
        profileId: profileIdLookup.getProfileId(q.userId), //TODO: Remove this when using the header method above
        title: q.title,
        questionText: q.question,
        option: q.option,
      }),
    });
    const question = await response.json();
    const messageId = question.return.messageId;
    const messageBody = await getMessageById(qNameQuestionCreatedEvent, messageId);
    const questionId = messageBody ? messageBody.aggregateId : null;
    questionIdLookup.add(q.questionId, questionId);
    await removeMessagesByIds(qNameQuestionCreatedEvent, [messageId]);
      expect(response.ok).toBeTruthy();
  });
}

const checkQuestion = (profileIdLookup) => {
  test.each(questionTestResult())("There should be $count questions by user $userId", async (r) => {
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

export { checkQuestion, questionIdLookup };
