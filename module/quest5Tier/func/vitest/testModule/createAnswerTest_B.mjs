/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { createRequire } from "module";
import { test, expect } from "vitest";

const require = createRequire(import.meta.url);
const { generateToken } = require("../../service/authUtils");
const baseUrl = process.env.BASE_URL;
const questionUrl = new URL("/questionQry", baseUrl);

const checkAnswer = (profileIdLookup, questionIdLookup) => {
  test.each(getAnswerTestResult())("There should be $count answers for question $questionId.", async (r) => {
    if (!tokenLookup.data) {
      tokenLookup.add(generateToken({ profileId: profileIdLookup.data[0].profileId }));
    }
    const response = await fetch(questionUrl + "/getAnswers/" + questionIdLookup.getQuestionId(r.questionId), {
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

export { checkAnswer };
