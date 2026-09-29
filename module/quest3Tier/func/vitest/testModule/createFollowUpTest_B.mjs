/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const baseUrl = process.env.QUESTION_URL;
const sharedQuestionUrl = new URL("/sharedQuestions", baseUrl);
import { test, expect } from "vitest";

// Follow-ups are no longer stored as commands/events, so the check is on the receiving side:
// each receiver's shared list must contain the follow-up questions sent to them.
const checkShareQuestion = (profileIdLookup) => {
  test.each(shareQuestionData())("There should be $count follow-up questions shared with user $userId", async (shared) => {
    const response = await fetch(sharedQuestionUrl, {
      method: "GET",
      headers: { Accept: "application/json", authorization: `Bearer ${profileIdLookup.getAuthToken(shared.userId)}` },
    });
    const resultData = await response.json();
    expect(resultData.return.list.length).toBe(shared.count);
  });
};

function shareQuestionData() {
  return [
    { userId: 2, count: 1 },
    { userId: 3, count: 5 },
    { userId: 4, count: 3 },
    { userId: 5, count: 3 },
    { userId: 6, count: 5 },
    { userId: 7, count: 4 },
    { userId: 8, count: 2 },
    { userId: 9, count: 4 },
    { userId: 10, count: 4 },
    { userId: 11, count: 3 },
    { userId: 12, count: 4 },
    { userId: 13, count: 3 },
    { userId: 14, count: 2 },
    { userId: 15, count: 3 },
    { userId: 16, count: 5 },
    { userId: 17, count: 4 },
    { userId: 18, count: 4 },
    { userId: 19, count: 3 },
    { userId: 20, count: 4 },
  ];
}

export { checkShareQuestion };
