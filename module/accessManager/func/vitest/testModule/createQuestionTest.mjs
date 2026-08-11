/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const baseUrl = process.env.QUESTION_URL;
const questionUrl = new URL("/question", baseUrl);
const questionProfileUrl = new URL("/profile", baseUrl);
import { questionData, questionTestResult } from "./createQuestionTestData.mjs";
import { test, expect } from "vitest";

export function createQuestion(profileIdLookup) {
  test.each(questionData())(
    "create question $questionId",
    async (q) => {
      const response = await fetch(questionUrl, {
        headers: { "Content-Type": "application/json", authorization: `Bearer ${profileIdLookup.getAuthToken(q.userId)}` },
        method: "POST",
        body: JSON.stringify({
          profileId: profileIdLookup.getProfileId(q.userId),
          title: q.title,
          questionText: q.question,
          option: q.option,
        }),
      });

      let question = await response.json();
      console.log("create question response", question);
      let questionId = question.return.id;
      questionIdLookup.add(q.questionId, questionId);

      expect(response.ok).toBeTruthy();
    },
    10000
  );
}

const checkQuestion = (profileIdLookup) => {
  test.each(questionTestResult())("There should be $count questions by user $userId.", async (r) => {
    const response = await fetch(questionProfileUrl + "/" + profileIdLookup.getProfileId(r.userId) + "/question", {
      method: "GET",
      headers: {
        Accept: "application/json",
        authorization: `Bearer ${profileIdLookup.getAuthToken(r.userId)}`,
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
