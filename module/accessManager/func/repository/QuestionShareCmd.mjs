/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import {
  createTableEntity,
  deleteTableEntity,
  escapeTableFilterValue,
  findTableEntityByRowKey,
  getTableEntity,
  listTableEntities,
  serialiseJson,
  updateTableEntity,
} from "./tableCrud.mjs";

export default (tableClient, questionShareEventRepository) => ({
  async create(data) {
    if (!data?.senderProfileId || !data.action || data.data === undefined) {
      throw new Error("QuestionShareCmd requires senderProfileId, action, and data.");
    }

    const entity = {
      partitionKey: data.senderProfileId,
      rowKey: data.id || data.rowKey || uuidv4(),
      action: data.action,
      data: serialiseJson(data.data),
      status: data.status ?? 0,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    if (data.correlationId != null) entity.correlationId = data.correlationId;

    return createTableEntity(tableClient, entity);
  },

  async findByCompositeKey(id, senderProfileId) {
    return getTableEntity(tableClient, senderProfileId, id);
  },

  async findAll(filter = {}) {
    if (typeof filter === "string") return listTableEntities(tableClient, filter);

    const where = filter?.where ?? filter ?? {};
    const conditions = [];
    for (const property of ["senderProfileId", "correlationId", "action"]) {
      if (where[property] != null) {
        conditions.push(`${property} eq '${escapeTableFilterValue(where[property])}'`);
      }
    }
    if (where.status != null) conditions.push(`status eq ${where.status}`);
    if (where.id != null || where.rowKey != null) {
      conditions.push(`RowKey eq '${escapeTableFilterValue(where.id ?? where.rowKey)}'`);
    }

    return listTableEntities(tableClient, conditions.join(" and "));
  },

  async update(data, options = {}) {
    const id = data?.id ?? data?.rowKey ?? options?.where?.id ?? options?.where?.rowKey;
    const senderProfileId = data?.senderProfileId ?? data?.partitionKey ?? options?.where?.senderProfileId;
    if (!id) {
      throw new Error("QuestionShareCmd update requires an id or rowKey.");
    }

    const existing = senderProfileId
      ? await getTableEntity(tableClient, senderProfileId, id)
      : await findTableEntityByRowKey(tableClient, id);
    if (!existing) return null;

    const previousStatus = existing.status;
    const entity = {
      ...existing,
      ...data,
      partitionKey: existing.partitionKey,
      rowKey: existing.rowKey,
      data: data.data === undefined ? existing.data : serialiseJson(data.data),
      updatedAt: new Date(),
    };
    delete entity.id;
    delete entity.senderProfileId;
    delete entity.previousStatus;

    await updateTableEntity(tableClient, entity);

    if (previousStatus !== 1 && entity.status === 1 && options.individualHooks !== false) {
      if (!questionShareEventRepository) {
        throw new Error("QuestionShareEvent repository is required to record command status events.");
      }
      await questionShareEventRepository.create({
        questionShareId: existing.rowKey,
        correlationId: existing.correlationId,
        action: "create",
        senderProfileId: existing.partitionKey,
        actionData: {
          id: existing.rowKey,
          senderProfileId: existing.partitionKey,
          correlationId: existing.correlationId,
          action: existing.action,
          data: JSON.parse(existing.data),
          status: entity.status,
        },
        originalData: null,
      });
    }

    return entity;
  },

  async delete(id, senderProfileId) {
    return deleteTableEntity(tableClient, senderProfileId, id);
  },
});
