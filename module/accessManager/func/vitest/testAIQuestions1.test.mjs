/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { describe, test, expect, beforeAll } from "vitest";
import { v4 as uuidv4 } from "uuid";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createUser, profileIdLookup } from "./testModule/createUserTest.mjs";
import { createQuestion, checkQuestion, questionIdLookup } from "./testModule/createQuestionTest.mjs";
import { createAnswer } from "./testModule/createAnswerTest.mjs";
import { checkAnswer } from "./testModule/createAnswerTest_B.mjs";
import { createFollowUp } from "./testModule/createFollowUpTest.mjs";
import { checkShareQuestion, checkFollowUpQty } from "./testModule/createFollowUpTest_B.mjs";

const testCorrelationId = uuidv4();
let ddtPersonalAiData;
let selectedTestData;
let expectedResults;

describe("test question data", () => {
  beforeAll(async () => {
    // Runs exactly once before any test in this file begins
    console.log("Pre-test global state configured.");

    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const ddtPath = path.resolve(currentDir, "testModule", "DDT-PersonalAI1.json");
    const ddtJson = await readFile(ddtPath, "utf8");
    ddtPersonalAiData = JSON.parse(ddtJson);

    expect(Array.isArray(ddtPersonalAiData?.questions)).toBeTruthy();
    console.log(`Loaded ${ddtPersonalAiData.questions.length} questions from ${ddtPath}`);

    // Select a deterministic subset so test runs are stable and repeatable.
    const slicedQuestions = ddtPersonalAiData.questions.slice(0, 6);
    const selectedQuestionIds = new Set(slicedQuestions.map((q) => q.questionId));

    selectedTestData = {
      ...ddtPersonalAiData,
      questions: slicedQuestions.map((q) => ({
        ...q,
        answers: Array.isArray(q.answers) ? q.answers.slice(0, 8) : [],
        followUpQuestions: Array.isArray(q.followUpQuestions)
          ? q.followUpQuestions.filter((f) => selectedQuestionIds.has(f.questionId) && selectedQuestionIds.has(f.newQuestionId))
          : [],
      })),
    };

    expectedResults = {
      questionCount: selectedTestData.questions.length,
      answerCountByQuestionId: selectedTestData.questions.map((q) => ({
        questionId: q.questionId,
        count: q.answers.length,
      })),
      followUpQuestionCount: selectedTestData.questions.reduce((total, q) => total + q.followUpQuestions.length, 0),
    };

    const requiredUserIds = new Set();
    selectedTestData.questions.forEach((q) => {
      requiredUserIds.add(q.userId);
      q.answers.forEach((a) => requiredUserIds.add(a.userId));
      q.followUpQuestions.forEach((f) => requiredUserIds.add(f.userId));
    });

    expectedResults.requiredUserAccountIds = [...requiredUserIds].sort((a, b) => a - b);
    expectedResults.requiredUserAccountCount = expectedResults.requiredUserAccountIds.length;

    console.log("Selected test subset summary", {
      questionCount: expectedResults.questionCount,
      followUpQuestionCount: expectedResults.followUpQuestionCount,
      answerCountByQuestionId: expectedResults.answerCountByQuestionId,
      requiredUserAccountCount: expectedResults.requiredUserAccountCount,
      requiredUserAccountIds: expectedResults.requiredUserAccountIds,
    });

    // Calculate the user accounts needed for the test data.

    createUser();

    // TODO: Add AssertDependencies test to confirm the environment is ready for the test to run.Add
  });

  test("subset data and expected results are computed", () => {
    expect(selectedTestData).toBeDefined();
    expect(expectedResults).toBeDefined();
    expect(expectedResults.questionCount).toBe(6);
    expect(expectedResults.answerCountByQuestionId.every((x) => x.count > 0)).toBeTruthy();
    expect(expectedResults.followUpQuestionCount).toBeGreaterThanOrEqual(0);
    expect(expectedResults.requiredUserAccountCount).toBeGreaterThan(0);
    expect(expectedResults.requiredUserAccountIds.every((id) => Number.isInteger(id) && id > 0)).toBeTruthy();
    const selectedQuestionIds = new Set(selectedTestData.questions.map((q) => q.questionId));
    const hasOutOfSliceFollowUps = selectedTestData.questions.some((q) =>
      q.followUpQuestions.some((f) => !selectedQuestionIds.has(f.questionId) || !selectedQuestionIds.has(f.newQuestionId))
    );
    expect(hasOutOfSliceFollowUps).toBeFalsy();
  });

  //TODO: use the defined data to call the test modules.
  describe("create questions", () => {
    createQuestion(profileIdLookup);
    checkQuestion(profileIdLookup);
  });

  describe("create answers", () => {
    createAnswer(profileIdLookup, questionIdLookup);
    checkAnswer(profileIdLookup, questionIdLookup);
  });

  describe("create follow-ups", () => {
    createFollowUp(profileIdLookup, questionIdLookup, testCorrelationId);
    checkShareQuestion(profileIdLookup, testCorrelationId);
    checkFollowUpQty(testCorrelationId, profileIdLookup);
  });
});
