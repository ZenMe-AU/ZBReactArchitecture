/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { questionData, questionTestResult } from "./createQuestionTestData.mjs";
import { test, expect } from "vitest";
import questionHandler from "../../handler/questionHandler.mjs";
import { invokeHandler } from "./functionAppMock.mjs";

export function createQuestion(profileIdLookup) {
  test.each(questionData())("create question $questionId", async (q) => {
    const question = await invokeHandler(questionHandler.CreateQuestion, {
      userData: {
        profileId: await profileIdLookup.getProfileId(q.userId),
      },
      clientParams: {
        title: q.title,
        questionText: q.question,
        option: q.option,
      },
    });

    const questionId = question.return.id;
    questionIdLookup.add(q.questionId, questionId);
    expect(questionId).toBeDefined();
  }, 10000);
}

const checkQuestion = (profileIdLookup) => {
  test.each(questionTestResult())("There should be $count questions by user $userId", async (r) => {
    const response = await invokeHandler(questionHandler.GetQuestionListByUser, {
      userData: {
        profileId: await profileIdLookup.getProfileId(r.userId),
      },
    });
    expect(response.return.list.length).toBe(r.count);
  });
};

const questionIdLookup = {
  data: [],
  add(testId, questionId) {
    this.data.push({ testId, questionId });
  },
  getQuestionId(id) {
    const obj = this.data.filter(({ testId }) => testId == id).pop();
    return obj ? obj.questionId : null;
  },
};

export { checkQuestion, questionIdLookup };
