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

function toEntity(data) {
  if (!data?.senderProfileId || !data.questionShareId || !data.action || data.actionData === undefined) {
    throw new Error("QuestionShareEvent requires senderProfileId, questionShareId, action, and actionData.");
  }

  const entity = {
    partitionKey: data.senderProfileId,
    rowKey: data.id || data.rowKey || uuidv4(),
    questionShareId: data.questionShareId,
    action: data.action,
    actionData: serialiseJson(data.actionData),
    createdAt: data.createdAt || new Date(),
  };

  if (data.correlationId != null) entity.correlationId = data.correlationId;
  if (data.originalData != null) entity.originalData = serialiseJson(data.originalData);

  return entity;
}

export default (tableClient) => ({
  async create(data) {
    return createTableEntity(tableClient, toEntity(data));
  },

  async findByCompositeKey(id, senderProfileId) {
    return getTableEntity(tableClient, senderProfileId, id);
  },

  async findAll(filter = {}) {
    if (typeof filter === "string") {
      return listTableEntities(tableClient, filter);
    }

    const where = filter?.where ?? filter;
    const conditions = [];
    for (const property of ["correlationId", "questionShareId", "senderProfileId"]) {
      if (where?.[property] != null) {
        conditions.push(`${property} eq '${escapeTableFilterValue(where[property])}'`);
      }
    }

    return listTableEntities(tableClient, conditions.join(" and "));
  },

  async update(data) {
    if (!data?.id && !data?.rowKey) {
      throw new Error("QuestionShareEvent update requires id or rowKey.");
    }
    const entity = toEntity(data);
    return updateTableEntity(tableClient, entity);
  },

  async delete(id, senderProfileId) {
    return deleteTableEntity(tableClient, senderProfileId, id);
  },
});
