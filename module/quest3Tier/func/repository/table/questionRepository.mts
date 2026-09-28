/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Question repository backed by Azure Table Storage. Question logs and actions
// are stored in the acting profile's UserEvents projection.

import { randomUUID } from "crypto";
import fastJsonPatch from "fast-json-patch";
import { odata, TableTransaction } from "@azure/data-tables";
import type { UpdateMode } from "@azure/data-tables";
import { getTableClient, isNotFoundError } from "./tableClient.mjs";
import { assertProfileExists } from "./profileRepository.mjs";
import { appendQuestionLog, removeQuestionLog } from "./workflowRepository.mjs";
import type { QuestionAction, QuestionLog } from "./workflowRepository.mjs";
import {
  QUESTION_DATA_TABLE,
  questionPartitionKey,
  questionRowKey,
  QUESTION_ROW_KEY_RANGE_START,
  QUESTION_ROW_KEY_RANGE_END,
  shareRowKey,
  SHARE_ROW_KEY_RANGE_START,
  SHARE_ROW_KEY_RANGE_END,
} from "./keys.mjs";
import type { QuestionEntity, QuestionDetail, QuestionListItem, QuestionShareEntity } from "./entities.mjs";

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

function toQuestionDetail(entity: QuestionEntity): QuestionDetail {
  return {
    id: entity.id,
    title: entity.title ?? null,
    questionText: entity.questionText,
    option: entity.option ? JSON.parse(entity.option) : null,
    profileId: entity.profileId,
  };
}

export async function createQuestion(input: CreateQuestionInput): Promise<{ id: string }> {
  await assertProfileExists(input.profileId);
  const id = randomUUID();
  const eventId = randomUUID();
  const createdAt = new Date().toISOString();
  const questionEntity: QuestionEntity = {
    partitionKey: questionPartitionKey(input.profileId),
    rowKey: questionRowKey(id),
    id,
    profileId: input.profileId,
    title: input.title,
    questionText: input.questionText,
    option: JSON.stringify(input.option ?? null),
    eventId,
    createdAt,
  };
  const logEntity: QuestionLog = {
    id: eventId,
    questionId: id,
    profileId: input.profileId,
    action: "create",
    actionData: JSON.stringify(toQuestionDetail(questionEntity)),
    originalData: null,
    lastEventId: null,
    createdAt,
  };

  const client = await getTableClient(QUESTION_DATA_TABLE);
  await writeWithQuestionLog(input.profileId, logEntity, () => client.createEntity(questionEntity));

  return { id };
}

export async function getQuestionById(questionId: string): Promise<QuestionDetail | null> {
  const entity = await getQuestionEntity(questionId);
  return entity ? toQuestionDetail(entity) : null;
}

async function getQuestionEntity(questionId: string): Promise<(QuestionEntity & { etag: string }) | null> {
  const client = await getTableClient(QUESTION_DATA_TABLE);
  const rows = client.listEntities<QuestionEntity>({
    queryOptions: { filter: odata`RowKey eq ${questionRowKey(questionId)}` },
  });
  for await (const row of rows) return row as QuestionEntity & { etag: string };
  return null;
}

function toQuestionListItem(entity: QuestionEntity): QuestionListItem {
  return { ...toQuestionDetail(entity), eventId: entity.eventId ?? null, createdAt: entity.createdAt };
}

/**
 * Questions the profile owns plus questions shared with it, oldest first --
 * the Postgres "profileId = me OR QuestionShares.receiverProfileId = me" query.
 */
export async function getQuestionListByProfileId(profileId: string): Promise<QuestionListItem[]> {
  const client = await getTableClient(QUESTION_DATA_TABLE);
  // ponytail: both lookups scan the whole table; add a per-profile index table if QuestionData grows large.
  const owned = client.listEntities<QuestionEntity>({
    queryOptions: {
      filter: odata`PartitionKey eq ${questionPartitionKey(profileId)} and RowKey ge ${QUESTION_ROW_KEY_RANGE_START} and RowKey lt ${QUESTION_ROW_KEY_RANGE_END}`,
    },
  });
  const questions = new Map<string, QuestionListItem>();
  for await (const entity of owned) questions.set(entity.id, toQuestionListItem(entity));

  for (const question of await getSharedQuestionListByProfileId(profileId)) questions.set(question.id, question);

  return [...questions.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getSharedQuestionListByProfileId(profileId: string): Promise<QuestionListItem[]> {
  const client = await getTableClient(QUESTION_DATA_TABLE);
  // ponytail: this scans QuestionData; add a per-profile index table when measured volume requires it.
  const shares = client.listEntities<QuestionShareEntity>({
    queryOptions: { filter: odata`RowKey ge ${SHARE_ROW_KEY_RANGE_START} and RowKey lt ${SHARE_ROW_KEY_RANGE_END} and receiverProfileId eq ${profileId}` },
  });
  const sharedIds = new Set<string>();
  for await (const share of shares) sharedIds.add(share.newQuestionId);
  const questions = await Promise.all([...sharedIds].map(getQuestionEntity));
  return questions.filter((entity): entity is QuestionEntity & { etag: string } => entity !== null).map(toQuestionListItem).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function shareQuestion(questionId: string, senderProfileId: string, receiverProfileIds: string[]): Promise<void> {
  // Postgres enforced these with foreign keys.
  await Promise.all([senderProfileId, ...receiverProfileIds].map(assertProfileExists));
  if (!(await getQuestionEntity(questionId))) {
    throw new Error(`Question not found for questionId: ${questionId}`);
  }

  const createdAt = new Date().toISOString();
  const shares = receiverProfileIds.map((receiverProfileId): QuestionShareEntity => {
    const id = randomUUID();
    return {
      partitionKey: questionPartitionKey(senderProfileId),
      rowKey: shareRowKey(questionId, id),
      id,
      newQuestionId: questionId,
      senderProfileId,
      receiverProfileId,
      status: 0,
      type: 0,
      createdAt,
    };
  });

  const client = await getTableClient(QUESTION_DATA_TABLE);
  // ponytail: a Table transaction holds at most 100 rows, so sharing with more receivers is not atomic.
  for (let i = 0; i < shares.length; i += 100) {
    const transaction = new TableTransaction();
    for (const share of shares.slice(i, i + 100)) transaction.createEntity(share);
    await client.submitTransaction(transaction.actions);
  }
}

/**
 * Builds the (question row, audit log row) pair for a field update, without
 * submitting them. Shared by updateQuestionById and patchQuestionById so the
 * log row shape stays in exactly one place.
 */
function buildUpdateEntities(
  questionId: string,
  existing: QuestionEntity & { etag: string },
  next: UpdateQuestionInput,
  action: "update",
  eventProfileId: string
): { updatedEntity: QuestionEntity; logEntity: QuestionLog } {
  const eventId = randomUUID();
  const updatedEntity: QuestionEntity = {
    partitionKey: existing.partitionKey,
    rowKey: existing.rowKey,
    id: questionId,
    profileId: existing.profileId,
    title: next.title,
    questionText: next.questionText ?? existing.questionText,
    option: JSON.stringify(next.option ?? null),
    eventId,
    createdAt: existing.createdAt,
  };
  const logEntity: QuestionLog = {
    id: eventId,
    questionId,
    profileId: eventProfileId,
    action,
    actionData: JSON.stringify(toQuestionDetail(updatedEntity)),
    originalData: JSON.stringify(toQuestionDetail(existing)),
    lastEventId: existing.eventId ?? null,
    createdAt: new Date().toISOString(),
  };
  return { updatedEntity, logEntity };
}

async function writeWithQuestionLog(profileId: string, log: QuestionLog, write: () => Promise<unknown>, action?: QuestionAction): Promise<void> {
  await appendQuestionLog(profileId, log, action);
  try {
    await write();
  } catch (err) {
    await removeQuestionLog(profileId, log.id, action?.id);
    throw err;
  }
}

export async function updateQuestionById(questionId: string, input: UpdateQuestionInput, profileId: string): Promise<{ id: string }> {
  await assertProfileExists(profileId);
  const existing = await getQuestionEntity(questionId);
  if (!existing) {
    throw new Error(`Question not found for questionId: ${questionId}`);
  }
  const { updatedEntity, logEntity } = buildUpdateEntities(questionId, existing, input, "update", profileId);

  const replaceMode: UpdateMode = "Replace";
  const client = await getTableClient(QUESTION_DATA_TABLE);
  await writeWithQuestionLog(profileId, logEntity, () => client.updateEntity(updatedEntity, replaceMode, { etag: existing.etag }));

  return { id: questionId };
}

/**
 * Apply a JSON Patch (RFC 6902) to a question, recording both the raw patch
 * (action) and the resulting field change (log) in the acting profile's
 * UserEvents projection in one write, then updating the question; both
 * records are removed if the question update fails. Returns the id of the
 * recorded patch action.
 */
export async function patchQuestionById(questionId: string, profileId: string, patchOps: unknown): Promise<{ id: string }> {
  await assertProfileExists(profileId);
  const existing = await getQuestionEntity(questionId);
  if (!existing) {
    throw new Error(`Question not found for questionId: ${questionId}`);
  }

  const patched = fastJsonPatch.applyPatch(toQuestionDetail(existing), patchOps as never).newDocument;

  const action: QuestionAction = {
    id: randomUUID(),
    questionId,
    profileId,
    action: JSON.stringify(patchOps),
    createdAt: new Date().toISOString(),
  };

  const { updatedEntity, logEntity } = buildUpdateEntities(
    questionId,
    existing,
    { title: patched.title, questionText: patched.questionText, option: patched.option },
    "update",
    profileId
  );

  const replaceMode: UpdateMode = "Replace";
  const client = await getTableClient(QUESTION_DATA_TABLE);
  await writeWithQuestionLog(profileId, logEntity, () => client.updateEntity(updatedEntity, replaceMode, { etag: existing.etag }), action);

  return { id: action.id };
}
