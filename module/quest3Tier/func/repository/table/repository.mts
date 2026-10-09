/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { randomUUID } from "crypto";
import { odata } from "@azure/data-tables";
import { createQuestion, getQuestionById, getQuestionListByProfileId, getSharedQuestionListByProfileId, patchQuestionById, shareQuestion, updateQuestionById } from "./questionRepository.mjs";
import { addAnswer, getAnswerById, getAnswerListByQuestionId } from "./answerRepository.mjs";
import { createProfile, findProfileByExternalId } from "./profileRepository.mjs";
import { getTableClient } from "./tableClient.mjs";
import { QUESTION_DATA_TABLE } from "./keys.mjs";
import type { QuestRepository } from "../contracts.mjs";
import cmdName from "../../enum/cmdName.mjs";

type CommandKind = "FollowUpCmd" | "QuestionShareCmd";

interface CommandEntity {
  partitionKey: string;
  rowKey: string;
  id: string;
  commandType: CommandKind;
  correlationId: string;
  senderProfileId: string;
  action: string;
  data: string;
  status: number;
  createdAt: string;
  etag?: string;
}

interface EventEntity {
  partitionKey: string;
  rowKey: string;
  id: string;
  eventType: CommandKind;
  commandId: string;
  correlationId: string;
  senderProfileId: string;
  action: string;
  actionData: string;
  createdAt: string;
}

function commandRowKey(kind: CommandKind, id: string): string {
  return `command:${kind}:${id}`;
}

function parseJson(value: string | undefined): unknown {
  return value ? JSON.parse(value) : null;
}

async function insertCommand(kind: CommandKind, senderId: string, data: Record<string, unknown>, correlationId: string) {
  const command: CommandEntity = {
    partitionKey: senderId,
    rowKey: commandRowKey(kind, randomUUID()),
    id: "",
    commandType: kind,
    correlationId,
    senderProfileId: senderId,
    action: "create",
    data: JSON.stringify(data),
    status: 0,
    createdAt: new Date().toISOString(),
  };
  command.id = command.rowKey.slice(command.rowKey.lastIndexOf(":") + 1);
  await (await getTableClient(QUESTION_DATA_TABLE)).createEntity(command);
  return command;
}

async function findCommand(kind: CommandKind, id: string): Promise<CommandEntity | null> {
  const client = await getTableClient(QUESTION_DATA_TABLE);
  const entities = client.listEntities<CommandEntity>({
    queryOptions: { filter: odata`RowKey eq ${commandRowKey(kind, id)}` },
  });
  for await (const entity of entities) return entity as CommandEntity;
  return null;
}

async function createCommandEvent(command: CommandEntity): Promise<void> {
  const event: EventEntity = {
    partitionKey: command.partitionKey,
    rowKey: `event:${command.commandType}:${command.correlationId}:${randomUUID()}`,
    id: randomUUID(),
    eventType: command.commandType,
    commandId: command.id,
    correlationId: command.correlationId,
    senderProfileId: command.senderProfileId,
    action: command.action,
    actionData: JSON.stringify({ ...command, data: parseJson(command.data), status: 1 }),
    createdAt: new Date().toISOString(),
  };
  await (await getTableClient(QUESTION_DATA_TABLE)).createEntity(event);
}

async function updateCommandStatus(kind: CommandKind, id: string): Promise<{ id: string }> {
  const client = await getTableClient(QUESTION_DATA_TABLE);
  const command = await findCommand(kind, id);
  if (!command) throw new Error(`${kind} not found for id: ${id}`);

  if (command.status !== 1) {
    await client.updateEntity({ ...command, status: 1 }, "Merge", { etag: command.etag });
    await createCommandEvent(command);
  }
  return { id };
}

async function getEvents(kind: CommandKind, correlationId: string): Promise<unknown[]> {
  const client = await getTableClient(QUESTION_DATA_TABLE);
  const entities = client.listEntities<EventEntity>({
    queryOptions: { filter: odata`eventType eq ${kind} and correlationId eq ${correlationId}` },
  });
  const events = [];
  for await (const entity of entities) {
    const event = entity as EventEntity;
    events.push({
      id: event.id,
      ...(kind === "FollowUpCmd" ? { followUpId: event.commandId } : { questionShareId: event.commandId }),
      correlationId: event.correlationId,
      action: event.action,
      senderProfileId: event.senderProfileId,
      actionData: parseJson(event.actionData),
      createdAt: event.createdAt,
    });
  }
  return events;
}

const repository = {
  async findProfileByExternalId(externalId: string) {
    const profile = await findProfileByExternalId(externalId);
    return profile ? { id: profile.internalId, externalId: profile.externalId } : null;
  },

  async createProfile(externalId: string) {
    const profile = await createProfile(externalId);
    return { id: profile.internalId, externalId: profile.externalId };
  },

  async getById(questionId: string) {
    return getQuestionById(questionId);
  },

  async create(profileId: string, title = null, question = null, option = null) {
    const created = await createQuestion({ profileId, title, questionText: question ?? "", option });
    const questionRecord = await getQuestionById(created.id);
    if (!questionRecord) throw new Error(`Question not found after creation: ${created.id}`);
    return questionRecord;
  },

  async updateById(questionId: string, title = null, questionText = null, option = null) {
    const question = await getQuestionById(questionId);
    if (!question) throw new Error(`Question not found for questionId: ${questionId}`);
    return updateQuestionById(questionId, { title, questionText, option }, question.profileId);
  },

  async getCombinationListByUser(profileId: string) {
    return getQuestionListByProfileId(profileId);
  },

  async patchById(questionId: string, action: unknown, profileId: string) {
    return patchQuestionById(questionId, profileId, action);
  },

  async addAnswerByQuestionId(questionId: string, profileId: string, duration: number, answer = null, option = null) {
    const created = await addAnswer({ questionId, profileId, duration, answerText: answer, optionId: option });
    const record = await getAnswerById(questionId, created.id);
    if (!record) throw new Error(`Answer not found after creation: ${created.id}`);
    return record;
  },

  async getAnswerById(questionId: string, answerId: string) {
    return getAnswerById(questionId, answerId);
  },

  async getAnswerListByQuestionId(questionId: string) {
    return getAnswerListByQuestionId(questionId);
  },

  async getEventByCorrelationId(name: string, correlationId: string) {
    if (name === cmdName.FollowUpCmd) return getEvents("FollowUpCmd", correlationId);
    if (name === cmdName.QuestionShareCmd) return getEvents("QuestionShareCmd", correlationId);
    throw new Error(`Unknown eventName: ${name}`);
  },

  async insertFollowUpCmd(senderId: string, data: Record<string, unknown>, correlationId: string) {
    const command = await insertCommand("FollowUpCmd", senderId, data, correlationId);
    return { id: command.id };
  },

  async insertFollowUpFilter(senderId: string, data: Record<string, unknown>) {
    if (!data.save || !Array.isArray(data.question)) return [];
    const client = await getTableClient(QUESTION_DATA_TABLE);
    const filterId = randomUUID();
    const newQuestionId = String(data.newQuestionId);
    const filters = data.question.map((item: any, index) => ({
      partitionKey: senderId,
      rowKey: `filter:${newQuestionId}:${filterId}:${index + 1}`,
      id: filterId,
      order: index + 1,
      senderProfileId: senderId,
      refQuestionId: item.questionId,
      refOption: JSON.stringify(item.option),
      newQuestionId,
      createdAt: new Date().toISOString(),
    }));
    for (const filter of filters) await client.createEntity(filter);
    return filters;
  },

  async updateFollowUpCmdStatus(id: string) {
    return updateCommandStatus("FollowUpCmd", id);
  },

  async shareQuestion(questionId: string, senderId: string, receiverIds: string[]) {
    await shareQuestion(questionId, senderId, receiverIds);
    return receiverIds.map((receiverProfileId) => ({ questionId, senderProfileId: senderId, receiverProfileId }));
  },

  async insertQuestionShareCmd(senderId: string, data: Record<string, unknown>, correlationId: string) {
    const command = await insertCommand("QuestionShareCmd", senderId, data, correlationId);
    return { id: command.id };
  },

  async updateQuestionShareCmdStatus(id: string) {
    return updateCommandStatus("QuestionShareCmd", id);
  },

  async getSharedQuestionListByProfileId(profileId: string) {
    return getSharedQuestionListByProfileId(profileId);
  },
} satisfies QuestRepository;

export default repository;