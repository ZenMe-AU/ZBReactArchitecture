/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Answer repository backed by Azure Table Storage. Answers live in the same partition as their question
// (questionId), RowKey "answer:{profileId}:{createdAt}:{answerId}", so a
// partition-scoped range scan already returns them grouped by profile and
// ordered oldest -> newest -- the last row seen per profile is the latest.

import { randomUUID } from "crypto";
import { odata } from "@azure/data-tables";
import { getTableClient } from "./tableClient.mjs";
import { assertProfileExists } from "./profileRepository.mjs";
import { getQuestionById } from "./questionRepository.mjs";
import { QUESTION_DATA_TABLE, questionPartitionKey, answerRowKey, ANSWER_ROW_KEY_RANGE_START, ANSWER_ROW_KEY_RANGE_END } from "./keys.mjs";
import type { AnswerEntity, AnswerListItem, AnswerRecord } from "./entities.mjs";

export interface AddAnswerInput {
  questionId: string;
  profileId: string;
  answerText: string | null;
  optionId: string | null;
  duration: number;
}

export async function addAnswer(input: AddAnswerInput): Promise<{ id: string }> {
  await assertProfileExists(input.profileId);
  // Answers live in their question's partition; without this check a bad id would create a partition with no question row.
  if (!(await getQuestionById(input.questionId))) {
    throw new Error(`Question not found for questionId: ${input.questionId}`);
  }
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const entity: AnswerEntity = {
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

// Table Storage drops null properties, so nullable fields come back undefined; restore the Postgres nulls here.
function toAnswerRecord(e: AnswerEntity): AnswerRecord {
  return {
    id: e.id,
    questionId: e.questionId,
    profileId: e.profileId,
    answerText: e.answerText ?? null,
    optionId: e.optionId ?? null,
    duration: e.duration,
    createdAt: e.createdAt,
  };
}

export async function getAnswerById(questionId: string, answerId: string): Promise<AnswerRecord | null> {
  const client = await getTableClient(QUESTION_DATA_TABLE);
  const results = client.listEntities<AnswerEntity>({
    queryOptions: { filter: odata`PartitionKey eq ${questionPartitionKey(questionId)} and id eq ${answerId}` },
  });
  for await (const entity of results) {
    return toAnswerRecord(entity);
  }
  return null;
}

export async function getAnswerListByQuestionId(questionId: string): Promise<AnswerListItem[]> {
  const client = await getTableClient(QUESTION_DATA_TABLE);
  const results = client.listEntities<AnswerEntity>({
    queryOptions: {
      filter: odata`PartitionKey eq ${questionPartitionKey(questionId)} and RowKey ge ${ANSWER_ROW_KEY_RANGE_START} and RowKey lt ${ANSWER_ROW_KEY_RANGE_END}`,
    },
  });

  const latestByProfile = new Map<string, AnswerListItem>();
  for await (const entity of results) {
    const existing = latestByProfile.get(entity.profileId);
    latestByProfile.set(entity.profileId, { ...toAnswerRecord(entity), answerCount: (existing?.answerCount ?? 0) + 1 });
  }

  return [...latestByProfile.values()];
}
