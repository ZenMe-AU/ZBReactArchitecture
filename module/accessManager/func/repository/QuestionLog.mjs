/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import {
  createTableEntity,
  deleteTableEntity,
  escapeTableFilterValue,
  getTableEntity,
  listTableEntities,
  serialiseJson,
  updateTableEntity,
} from "./tableCrud.mjs";

function buildFilter(filter) {
  if (typeof filter === "string") return filter;

  const where = filter?.where ?? filter ?? {};
  const conditions = [];
  for (const property of ["questionId", "profileId", "action", "lastEventId"]) {
    if (where[property] != null) {
      conditions.push(`${property} eq '${escapeTableFilterValue(where[property])}'`);
    }
  }
  if (where.id != null || where.rowKey != null) {
    conditions.push(`RowKey eq '${escapeTableFilterValue(where.id ?? where.rowKey)}'`);
  }
  return conditions.join(" and ");
}

function toEntity(data, existing = {}) {
  const profileId = data?.profileId ?? data?.partitionKey ?? existing.profileId;
  const questionId = data?.questionId ?? existing.questionId;
  const action = data?.action ?? existing.action;
  const actionData = data?.actionData ?? existing.actionData;
  if (!profileId || !questionId || !action || actionData === undefined) {
    throw new Error("QuestionLog requires profileId, questionId, action, and actionData.");
  }

  const entity = {
    partitionKey: profileId,
    rowKey: data.id || data.rowKey || existing.rowKey || uuidv4(),
    profileId,
    questionId,
    action,
    actionData: serialiseJson(actionData),
    createdAt: data.createdAt || existing.createdAt || new Date(),
  };

  const originalData = data.originalData ?? existing.originalData;
  const lastEventId = data.lastEventId ?? existing.lastEventId;
  if (originalData != null) entity.originalData = serialiseJson(originalData);
  if (lastEventId != null) entity.lastEventId = lastEventId;

  return entity;
}

export default (tableClient) => ({
  async create(data) {
    return createTableEntity(tableClient, toEntity(data));
  },

  async findByCompositeKey(id, profileId) {
    return getTableEntity(tableClient, profileId, id);
  },

  async findAll(filter = {}) {
    return listTableEntities(tableClient, buildFilter(filter));
  },

  async update(data) {
    const profileId = data?.profileId ?? data?.partitionKey;
    const id = data?.id ?? data?.rowKey;
    if (!profileId || !id) {
      throw new Error("QuestionLog update requires profileId and id.");
    }

    const existing = await getTableEntity(tableClient, profileId, id);
    if (!existing) return null;
    return updateTableEntity(tableClient, toEntity({ ...existing, ...data, profileId, id }, existing));
  },

  async delete(id, profileId) {
    return deleteTableEntity(tableClient, profileId, id);
  },
});
