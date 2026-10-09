/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// QuestionData is partitioned by profileId. RowKey prefixes preserve each
// PostgreSQL record type while keeping every record as a separate entity.

export const QUESTION_DATA_TABLE = "QuestionData";

export function questionPartitionKey(profileId: string): string {
  return profileId;
}

export function questionRowKey(questionId: string): string {
  return `question:${questionId}`;
}

export const QUESTION_ROW_KEY_RANGE_START = "question:";
export const QUESTION_ROW_KEY_RANGE_END = "question;";

export function answerRowKey(questionId: string, answerId: string): string {
  return `answer:${questionId}:${answerId}`;
}

export function answerRowKeyRange(questionId: string): [string, string] {
  return [`answer:${questionId}:`, `answer:${questionId};`];
}

export function shareRowKey(questionId: string, shareId: string): string {
  return `share:${questionId}:${shareId}`;
}

export const SHARE_ROW_KEY_RANGE_START = "share:";
export const SHARE_ROW_KEY_RANGE_END = "share;";
