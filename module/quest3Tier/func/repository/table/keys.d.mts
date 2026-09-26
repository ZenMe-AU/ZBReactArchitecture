/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
export declare const QUESTION_DATA_TABLE = "QuestionData";
export declare function questionPartitionKey(questionId: string): string;
export declare function questionRowKey(): string;
export declare function answerRowKey(profileId: string, createdAt: string, answerId: string): string;
export declare const ANSWER_ROW_KEY_RANGE_START = "answer:";
export declare const ANSWER_ROW_KEY_RANGE_END = "answer;";
export declare function eventRowKey(eventId: string): string;
