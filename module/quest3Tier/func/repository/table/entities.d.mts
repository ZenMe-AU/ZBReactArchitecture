/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
export interface QuestionEntity {
    partitionKey: string;
    rowKey: string;
    id: string;
    profileId: string;
    title: string | null;
    questionText: string;
    option: string;
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
    action: string;
    actionData: string | null;
    originalData: string | null;
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
