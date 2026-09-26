/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
// Explicit Question repository functions backed by Azure Table Storage,
// replacing repository/model/Question.mjs, QuestionLog.mjs and
// QuestionAction.mjs. Every write also appends an audit event row in the
// same partition (questionId), submitted as one Table batch transaction so
// the question row and its audit trail can never go out of sync.
import { randomUUID } from "crypto";
import { TableTransaction } from "@azure/data-tables";
import { getTableClient, isNotFoundError } from "./tableClient.mjs";
import { QUESTION_DATA_TABLE, questionPartitionKey, questionRowKey, eventRowKey } from "./keys.mjs";
function toQuestionDetail(entity) {
    return {
        id: entity.id,
        title: entity.title ?? null,
        questionText: entity.questionText,
        option: entity.option ? JSON.parse(entity.option) : null,
        profileId: entity.profileId,
    };
}
export async function createQuestion(input) {
    const id = randomUUID();
    const eventId = randomUUID();
    const questionEntity = {
        partitionKey: questionPartitionKey(id),
        rowKey: questionRowKey(),
        id,
        profileId: input.profileId,
        title: input.title,
        questionText: input.questionText,
        option: JSON.stringify(input.option ?? null),
        eventId,
    };
    const logEntity = {
        partitionKey: questionPartitionKey(id),
        rowKey: eventRowKey(eventId),
        id: eventId,
        questionId: id,
        profileId: input.profileId,
        eventKind: "log",
        action: "create",
        actionData: JSON.stringify(toQuestionDetail(questionEntity)),
        originalData: null,
        lastEventId: null,
        createdAt: new Date().toISOString(),
    };
    const transaction = new TableTransaction();
    transaction.createEntity(questionEntity);
    transaction.createEntity(logEntity);
    const client = await getTableClient(QUESTION_DATA_TABLE);
    await client.submitTransaction(transaction.actions);
    return { id };
}
export async function getQuestionById(questionId) {
    const entity = await getQuestionEntity(questionId);
    return entity ? toQuestionDetail(entity) : null;
}
async function getQuestionEntity(questionId) {
    const client = await getTableClient(QUESTION_DATA_TABLE);
    try {
        return await client.getEntity(questionPartitionKey(questionId), questionRowKey());
    }
    catch (err) {
        if (isNotFoundError(err))
            return null;
        throw err;
    }
}
/**
 * Builds the (question row, audit log row) pair for a field update, without
 * submitting them. Shared by updateQuestionById and patchQuestionById so the
 * log row shape stays in exactly one place.
 */
function buildUpdateEntities(questionId, existing, next, action) {
    const eventId = randomUUID();
    const updatedEntity = {
        partitionKey: questionPartitionKey(questionId),
        rowKey: questionRowKey(),
        id: questionId,
        profileId: existing.profileId,
        title: next.title,
        questionText: next.questionText ?? existing.questionText,
        option: JSON.stringify(next.option ?? null),
        eventId,
    };
    const logEntity = {
        partitionKey: questionPartitionKey(questionId),
        rowKey: eventRowKey(eventId),
        id: eventId,
        questionId,
        profileId: existing.profileId,
        eventKind: "log",
        action,
        actionData: JSON.stringify(toQuestionDetail(updatedEntity)),
        originalData: JSON.stringify(toQuestionDetail(existing)),
        lastEventId: existing.eventId ?? null,
        createdAt: new Date().toISOString(),
    };
    return { updatedEntity, logEntity };
}
export async function updateQuestionById(questionId, input) {
    const existing = await getQuestionEntity(questionId);
    if (!existing) {
        throw new Error(`Question not found for questionId: ${questionId}`);
    }
    const { updatedEntity, logEntity } = buildUpdateEntities(questionId, existing, input, "update");
    const transaction = new TableTransaction();
    const replaceMode = "Replace";
    transaction.updateEntity(updatedEntity, replaceMode, { etag: existing.etag });
    transaction.createEntity(logEntity);
    const client = await getTableClient(QUESTION_DATA_TABLE);
    await client.submitTransaction(transaction.actions);
    return { id: questionId };
}
/**
 * Apply a JSON Patch (RFC 6902) to a question, recording both the raw patch
 * (audit) and the resulting field change (log) in one batch transaction --
 * matching the two rows the Sequelize QuestionAction -> afterSave ->
 * Question.update hook chain used to produce, but atomic. Returns the id of
 * the recorded patch action.
 */
export async function patchQuestionById(questionId, profileId, patchOps) {
    const existing = await getQuestionEntity(questionId);
    if (!existing) {
        throw new Error(`Question not found for questionId: ${questionId}`);
    }
    const { applyPatch } = await import("fast-json-patch");
    const patched = applyPatch(toQuestionDetail(existing), patchOps).newDocument;
    const actionId = randomUUID();
    const actionEntity = {
        partitionKey: questionPartitionKey(questionId),
        rowKey: eventRowKey(actionId),
        id: actionId,
        questionId,
        profileId,
        eventKind: "action",
        action: JSON.stringify(patchOps),
        actionData: null,
        originalData: null,
        lastEventId: existing.eventId ?? null,
        createdAt: new Date().toISOString(),
    };
    const { updatedEntity, logEntity } = buildUpdateEntities(questionId, existing, { title: patched.title, questionText: patched.questionText, option: patched.option }, "update");
    const transaction = new TableTransaction();
    transaction.createEntity(actionEntity);
    const replaceMode = "Replace";
    transaction.updateEntity(updatedEntity, replaceMode, { etag: existing.etag });
    transaction.createEntity(logEntity);
    const client = await getTableClient(QUESTION_DATA_TABLE);
    await client.submitTransaction(transaction.actions);
    return { id: actionId };
}
