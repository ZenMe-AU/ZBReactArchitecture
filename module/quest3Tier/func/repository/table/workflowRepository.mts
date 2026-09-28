/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { randomUUID } from "crypto";
import { TableTransaction } from "@azure/data-tables";
import { getTableClient, isNotFoundError } from "./tableClient.mjs";
import { assertProfileExists } from "./profileRepository.mjs";

export const USER_EVENTS_TABLE = "UserEvents";
export const WORKFLOW_DATA_TABLE = "WorkflowData";
const EVENTS_ROW_KEY = "events";

export type CommandName = "FollowUpCmd" | "QuestionShareCmd";
type EventName = "FollowUpEvent" | "QuestionShareEvent";

export interface CommandEntity {
  partitionKey: string;
  rowKey: string;
  commandName: CommandName;
  id: string;
  correlationId: string | null;
  senderProfileId: string;
  action: string;
  data: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

interface StoredCommand extends Omit<CommandEntity, "partitionKey" | "rowKey"> {
  eventType: CommandName;
}

interface StoredEvent {
  eventType: EventName;
  id: string;
  followUpId?: string;
  questionShareId?: string;
  correlationId: string | null;
  action: string;
  senderProfileId: string;
  actionData: string;
  originalData: null;
  createdAt: string;
}

export interface QuestionLog {
  id: string;
  questionId: string;
  profileId: string;
  action: string;
  actionData: string;
  originalData: string | null;
  lastEventId: string | null;
  createdAt: string;
}

interface StoredQuestionLog extends QuestionLog {
  eventType: "LogQuestion";
}

// Field names follow the Postgres "questionAction" table.
export interface QuestionAction {
  id: string;
  questionId: string;
  profileId: string;
  action: string; // JSON-encoded JSON Patch ops
  createdAt: string;
}

interface StoredQuestionAction extends QuestionAction {
  eventType: "QuestionAction";
}

type StoredItem = StoredCommand | StoredEvent | StoredQuestionLog | StoredQuestionAction;

interface UserEventsEntity {
  partitionKey: string;
  rowKey: string;
  items: string;
  etag?: string;
}

export interface FollowUpFilterInput {
  id: string;
  order: number;
  senderProfileId: string;
  refQuestionId: string;
  refOption: unknown;
  newQuestionId: string;
}

const EVENT_NAME: Record<CommandName, EventName> = {
  FollowUpCmd: "FollowUpEvent",
  QuestionShareCmd: "QuestionShareEvent",
};

const EVENT_COMMAND_ID_FIELD: Record<CommandName, "followUpId" | "questionShareId"> = {
  FollowUpCmd: "followUpId",
  QuestionShareCmd: "questionShareId",
};

export function toUuid(value: string): string {
  const hex = value.replace(/[-{}]/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) throw new Error(`Invalid correlationId: ${value}`);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function filterPartitionKey(filterId: string): string {
  return `filter:${filterId}`;
}

export function filterRowKey(order: number): string {
  return `filter:${order}`;
}

function storedCommand({ partitionKey: _partitionKey, rowKey: _rowKey, ...command }: CommandEntity): StoredCommand {
  return { eventType: command.commandName, ...command };
}

function toCommandRecord({ partitionKey, rowKey, commandName, data, ...record }: CommandEntity) {
  return { ...record, data: JSON.parse(data) };
}

function isWriteConflict(err: unknown): boolean {
  return typeof err === "object" && err !== null && [409, 412].includes((err as { statusCode?: number }).statusCode ?? 0);
}

async function mutateEvents<T>(partitionKey: string, mutate: (items: StoredItem[]) => T): Promise<T> {
  const client = await getTableClient(USER_EVENTS_TABLE);

  // ponytail: one JSON projection is capped by Azure's entity limit; split it into time buckets when a user's event row approaches that limit.
  for (let attempt = 0; attempt < 5; attempt++) {
    let current: UserEventsEntity | null = null;
    try {
      current = await client.getEntity<UserEventsEntity>(partitionKey, EVENTS_ROW_KEY);
    } catch (err) {
      if (!isNotFoundError(err)) throw err;
    }

    const items: StoredItem[] = current ? JSON.parse(current.items) : [];
    const result = mutate(items);
    const next = { partitionKey, rowKey: EVENTS_ROW_KEY, items: JSON.stringify(items) };

    try {
      if (current) await client.updateEntity(next, "Replace", { etag: current.etag });
      else await client.createEntity(next);
      return result;
    } catch (err) {
      if (!isWriteConflict(err)) throw err;
    }
  }

  throw new Error("User events changed too frequently; retry the request");
}

async function getEvents(partitionKey: string): Promise<StoredItem[]> {
  try {
    const entity = await (await getTableClient(USER_EVENTS_TABLE)).getEntity<UserEventsEntity>(partitionKey, EVENTS_ROW_KEY);
    return JSON.parse(entity.items);
  } catch (err) {
    if (isNotFoundError(err)) return [];
    throw err;
  }
}

export async function createCommand(
  commandName: CommandName,
  senderProfileId: string,
  data: unknown,
  correlationId: string | null
): Promise<CommandEntity> {
  await assertProfileExists(senderProfileId);
  const id = randomUUID();
  const now = new Date().toISOString();
  const command: CommandEntity = {
    partitionKey: senderProfileId,
    rowKey: EVENTS_ROW_KEY,
    commandName,
    id,
    correlationId: correlationId ? toUuid(correlationId) : null,
    senderProfileId,
    action: "create",
    data: JSON.stringify(data),
    status: 0,
    createdAt: now,
    updatedAt: now,
  };

  await mutateEvents(command.partitionKey, (items) => items.push(storedCommand(command)));
  return command;
}

export async function completeCommand(command: CommandEntity): Promise<void> {
  const completed: CommandEntity = { ...command, status: 1, updatedAt: new Date().toISOString() };
  const eventId = randomUUID();

  await mutateEvents(command.partitionKey, (items) => {
    const commandIndex = items.findIndex((item) => item.eventType === command.commandName && item.id === command.id);
    if (commandIndex < 0) throw new Error(`Command not found: ${command.id}`);

    items[commandIndex] = storedCommand(completed);
    items.push({
      eventType: EVENT_NAME[command.commandName],
      id: eventId,
      [EVENT_COMMAND_ID_FIELD[command.commandName]]: command.id,
      correlationId: command.correlationId,
      action: "create",
      senderProfileId: command.senderProfileId,
      actionData: JSON.stringify(toCommandRecord(completed)),
      originalData: null,
      createdAt: completed.updatedAt,
    });
  });
}

export async function countEvents(commandName: CommandName, correlationId: string, profileId: string): Promise<number> {
  const normalizedCorrelationId = toUuid(correlationId);
  const items = await getEvents(profileId);
  return items.filter((item) => item.eventType === EVENT_NAME[commandName] && item.correlationId === normalizedCorrelationId).length;
}

// The optional action is written in the same projection update as its log, so both land or neither does.
export async function appendQuestionLog(profileId: string, log: QuestionLog, action?: QuestionAction): Promise<void> {
  await mutateEvents(profileId, (items) => {
    if (action) items.push({ eventType: "QuestionAction", ...action });
    items.push({ eventType: "LogQuestion", ...log });
  });
}

export async function removeQuestionLog(profileId: string, logId: string, actionId?: string): Promise<void> {
  await mutateEvents(profileId, (items) => {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if ((item.eventType === "LogQuestion" && item.id === logId) || (item.eventType === "QuestionAction" && item.id === actionId)) items.splice(i, 1);
    }
  });
}

export async function createFollowUpFilters(filters: FollowUpFilterInput[]): Promise<void> {
  if (filters.length === 0) return;
  const createdAt = new Date().toISOString();
  const transaction = new TableTransaction();
  for (const filter of filters) {
    transaction.createEntity({
      partitionKey: filterPartitionKey(filter.id),
      rowKey: filterRowKey(filter.order),
      ...filter,
      refOption: JSON.stringify(filter.refOption),
      createdAt,
    });
  }
  const client = await getTableClient(WORKFLOW_DATA_TABLE);
  await client.submitTransaction(transaction.actions);
}
