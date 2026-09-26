/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Row shapes stored under the QuestionData table. Table Storage properties
// are limited to String/Int32/Int64/Double/Boolean/DateTime/Guid/Binary, so
// arrays and objects (option, actionData, originalData) are stored as JSON
// strings and parsed back at the repository boundary.

export interface QuestionEntity {
  partitionKey: string;
  rowKey: string;
  id: string;
  profileId: string;
  title: string | null;
  questionText: string;
  option: string; // JSON-encoded string[] | null
  eventId: string;
  etag?: string;
}

export interface QuestionEventEntity {
  partitionKey: string;
  rowKey: string;
  id: string;
  questionId: string;
  profileId: string;
  eventKind: "log" | "action";
  action: string; // "create" | "update" for eventKind=log, JSON Patch ops for eventKind=action
  actionData: string | null; // JSON-encoded question snapshot, log rows only
  originalData: string | null; // JSON-encoded previous question snapshot, log rows only
  lastEventId: string | null;
  createdAt: string;
}

export interface AnswerEntity {
  partitionKey: string;
  rowKey: string;
  id: string;
  questionId: string;
  profileId: string;
  answerText: string | null;
  optionId: string | null;
  duration: number;
  createdAt: string;
}

// Shapes returned to handlers, matching the existing API response contract.
export interface QuestionDetail {
  id: string;
  title: string | null;
  questionText: string;
  option: string[] | null;
  profileId: string;
}

export interface AnswerListItem {
  id: string;
  profileId: string;
  questionId: string;
  answerText: string | null;
  optionId: string | null;
  duration: number;
  createdAt: string;
  answerCount: number;
}
