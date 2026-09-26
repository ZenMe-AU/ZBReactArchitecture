/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
import type { AnswerEntity, AnswerListItem } from "./entities.mjs";
export interface AddAnswerInput {
    questionId: string;
    profileId: string;
    answerText: string | null;
    optionId: string | null;
    duration: number;
}
export declare function addAnswer(input: AddAnswerInput): Promise<{
    id: string;
}>;
export declare function getAnswerById(questionId: string, answerId: string): Promise<AnswerEntity | null>;
export declare function getAnswerListByQuestionId(questionId: string): Promise<AnswerListItem[]>;
