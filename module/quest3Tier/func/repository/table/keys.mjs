/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
// PartitionKey/RowKey builders for the QuestionData table. One partition per
// questionId keeps Question + its answers + its audit trail inside a single
// Azure Table batch transaction (same-partition, up to 100 ops / 4 MiB).
// See: https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-design-guidelines
export const QUESTION_DATA_TABLE = "QuestionData";
export function questionPartitionKey(questionId) {
    return questionId;
}
export function questionRowKey() {
    return "question";
}
export function answerRowKey(profileId, createdAt, answerId) {
    return `answer:${profileId}:${createdAt}:${answerId}`;
}
// RowKey range bounds for "all answer rows in this partition". ':' + 1 char
// code point (';') bounds a prefix scan without matching unrelated rows.
export const ANSWER_ROW_KEY_RANGE_START = "answer:";
export const ANSWER_ROW_KEY_RANGE_END = "answer;";
export function eventRowKey(eventId) {
    return `event:${eventId}`;
}
