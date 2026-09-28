/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Replaces the Postgres followUpCmd / followUpFilter / followUpEvent and
// questionShareCmd / questionShareEvent tables. A command and its event share
// one partition per correlationId, so completing a command and writing its
// event is one transaction, and counting events is a single-partition query.

import { randomUUID } from "crypto";
import { odata, TableTransaction } from "@azure/data-tables";
import { getTableClient } from "./tableClient.mjs";
import { assertProfileExists } from "./profileRepository.mjs";

export const WORKFLOW_DATA_TABLE = "WorkflowData";

export type CommandName = "FollowUpCmd" | "QuestionShareCmd";

// Each Postgres event table named its command column differently.
export const EVENT_COMMAND_ID_FIELD: Record<CommandName, string> = { FollowUpCmd: "followUpId", QuestionShareCmd: "questionShareId" };

export interface CommandEntity {
  partitionKey: string;
  rowKey: string;
  commandName: CommandName;
  id: string;
  correlationId: string | null;
  senderProfileId: string;
  action: string;
  data: string; // JSON-encoded request body
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUpFilterInput {
  id: string;
  order: number;
  senderProfileId: string;
  refQuestionId: string;
  refOption: unknown;
  newQuestionId: string;
}

// correlationId was a Postgres uuid column: it accepted the dash-less form the UI sends and compared by value.
export function toUuid(value: string): string {
  const hex = value.replace(/[-{}]/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) throw new Error(`Invalid correlationId: ${value}`);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function commandPartitionKey(correlationId: string | null, commandId: string): string {
  return correlationId ?? `command:${commandId}`;
}

export function commandRowKey(commandName: CommandName, commandId: string): string {
  return `command:${commandName}:${commandId}`;
}

export function commandEventRowKey(commandName: CommandName, eventId: string): string {
  return `event:${commandName}:${eventId}`;
}

export function filterPartitionKey(filterId: string): string {
  return `filter:${filterId}`;
}

export function filterRowKey(order: number): string {
  return `filter:${order}`;
}

function toCommandRecord({ partitionKey, rowKey, commandName, data, ...record }: CommandEntity) {
  return { ...record, data: JSON.parse(data) };
}

export async function createCommand(commandName: CommandName, senderProfileId: string, data: unknown, correlationId: string | null): Promise<CommandEntity> {
  await assertProfileExists(senderProfileId);
  const id = randomUUID();
  const normalizedCorrelationId = correlationId ? toUuid(correlationId) : null;
  const now = new Date().toISOString();
  const command: CommandEntity = {
    partitionKey: commandPartitionKey(normalizedCorrelationId, id),
    rowKey: commandRowKey(commandName, id),
    commandName,
    id,
    correlationId: normalizedCorrelationId,
    senderProfileId,
    action: "create",
    data: JSON.stringify(data),
    status: 0,
    createdAt: now,
    updatedAt: now,
  };
  const client = await getTableClient(WORKFLOW_DATA_TABLE);
  await client.createEntity(command);
  return command;
}

// Store status 1 and its completion event in one transaction.
export async function completeCommand(command: CommandEntity): Promise<void> {
  const completed: CommandEntity = { ...command, status: 1, updatedAt: new Date().toISOString() };
  const eventId = randomUUID();
  const transaction = new TableTransaction();
  transaction.updateEntity(completed, "Replace");
  transaction.createEntity({
    partitionKey: command.partitionKey,
    rowKey: commandEventRowKey(command.commandName, eventId),
    id: eventId,
    [EVENT_COMMAND_ID_FIELD[command.commandName]]: command.id,
    correlationId: command.correlationId,
    action: "create",
    senderProfileId: command.senderProfileId,
    actionData: JSON.stringify(toCommandRecord(completed)),
    originalData: null,
    createdAt: completed.updatedAt,
  });
  const client = await getTableClient(WORKFLOW_DATA_TABLE);
  await client.submitTransaction(transaction.actions);
}

export async function countEvents(commandName: CommandName, correlationId: string): Promise<number> {
  const client = await getTableClient(WORKFLOW_DATA_TABLE);
  const events = client.listEntities({
    queryOptions: {
      filter: odata`PartitionKey eq ${toUuid(correlationId)} and RowKey ge ${`event:${commandName}:`} and RowKey lt ${`event:${commandName};`}`,
      select: ["RowKey"],
    },
  });
  let count = 0;
  for await (const _event of events) count++;
  return count;
}

// All rows of one filter share its id, so they land in one partition and one transaction.
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
