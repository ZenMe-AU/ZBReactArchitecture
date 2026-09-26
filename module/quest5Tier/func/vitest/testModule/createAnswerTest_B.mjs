/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { test, expect } from "vitest";

const baseUrl = process.env.QUESTION_URL;
const questionUrl = new URL("/questionQry", baseUrl);

const checkAnswer = (profileIdLookup, questionIdLookup) => {
  test.each(getAnswerTestResult())("There should be $count answers for question $questionId.", async (r) => {
    const response = await fetch(questionUrl + "/getAnswers/" + questionIdLookup.getQuestionId(r.questionId), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        authorization: `Bearer ${profileIdLookup.getAuthToken(1)}`,
      },
    });
    const resultData = await response.json();
    const qty = resultData.return.list.length;
    expect(qty).toBe(r.count);
  });
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

export { checkAnswer };
