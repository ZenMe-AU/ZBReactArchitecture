/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
// Explicit Answer repository functions backed by Azure Table Storage,
// replacing repository/model/QuestionAnswer.mjs and the raw
// "DISTINCT ON (profileId) ... ORDER BY profileId, createdAt DESC" query in
// answerHandler.mjs. Answers live in the same partition as their question
// (questionId), RowKey "answer:{profileId}:{createdAt}:{answerId}", so a
// partition-scoped range scan already returns them grouped by profile and
// ordered oldest -> newest -- the last row seen per profile is the latest.
import { randomUUID } from "crypto";
import { odata } from "@azure/data-tables";
import { getTableClient } from "./tableClient.mjs";
import { QUESTION_DATA_TABLE, questionPartitionKey, answerRowKey, ANSWER_ROW_KEY_RANGE_START, ANSWER_ROW_KEY_RANGE_END } from "./keys.mjs";
export async function addAnswer(input) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const entity = {
        partitionKey: questionPartitionKey(input.questionId),
        rowKey: answerRowKey(input.profileId, createdAt, id),
        id,
        questionId: input.questionId,
        profileId: input.profileId,
        answerText: input.answerText,
        optionId: input.optionId,
        duration: input.duration,
        createdAt,
    };
    const client = await getTableClient(QUESTION_DATA_TABLE);
    await client.createEntity(entity);
    return { id };
}
export async function getAnswerById(questionId, answerId) {
    const client = await getTableClient(QUESTION_DATA_TABLE);
    const results = client.listEntities({
        queryOptions: { filter: odata `PartitionKey eq ${questionPartitionKey(questionId)} and id eq ${answerId}` },
    });
    for await (const entity of results) {
        return entity;
    }
    return null;
}
export async function getAnswerListByQuestionId(questionId) {
    const client = await getTableClient(QUESTION_DATA_TABLE);
    const results = client.listEntities({
        queryOptions: {
            filter: odata `PartitionKey eq ${questionPartitionKey(questionId)} and RowKey ge ${ANSWER_ROW_KEY_RANGE_START} and RowKey lt ${ANSWER_ROW_KEY_RANGE_END}`,
        },
    });
    const latestByProfile = new Map();
    for await (const entity of results) {
        const existing = latestByProfile.get(entity.profileId);
        latestByProfile.set(entity.profileId, {
            id: entity.id,
            profileId: entity.profileId,
            questionId: entity.questionId,
            answerText: entity.answerText,
            optionId: entity.optionId,
            duration: entity.duration,
            createdAt: entity.createdAt,
            answerCount: (existing?.answerCount ?? 0) + 1,
        });
    }
    return [...latestByProfile.values()];
}
