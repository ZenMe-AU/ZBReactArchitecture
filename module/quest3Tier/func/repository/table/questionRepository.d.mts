/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
import type { QuestionDetail } from "./entities.mjs";
export interface CreateQuestionInput {
    profileId: string;
    title: string | null;
    questionText: string;
    option: string[] | null;
}
export interface UpdateQuestionInput {
    title: string | null;
    questionText: string | null;
    option: string[] | null;
}
export declare function createQuestion(input: CreateQuestionInput): Promise<{
    id: string;
}>;
export declare function getQuestionById(questionId: string): Promise<QuestionDetail | null>;
export declare function updateQuestionById(questionId: string, input: UpdateQuestionInput): Promise<{
    id: string;
}>;
/**
 * Apply a JSON Patch (RFC 6902) to a question, recording both the raw patch
 * (audit) and the resulting field change (log) in one batch transaction --
 * matching the two rows the Sequelize QuestionAction -> afterSave ->
 * Question.update hook chain used to produce, but atomic. Returns the id of
 * the recorded patch action.
 */
export declare function patchQuestionById(questionId: string, profileId: string, patchOps: unknown): Promise<{
    id: string;
}>;
