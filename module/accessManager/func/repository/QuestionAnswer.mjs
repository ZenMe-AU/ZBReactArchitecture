/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import {
  createTableEntity,
  getTableEntity,
  listTableEntities,
  updateTableEntity,
  deleteTableEntity,
  escapeTableFilterValue,
} from "./tableCrud.mjs";

export default (tableClient) => ({
  async create(data) {
    if (!data?.profileId || !data.questionId) {
      throw new Error("QuestionAnswer creation requires profileId and questionId.");
    }
    if (!Number.isInteger(data.duration)) {
      throw new Error("QuestionAnswer creation requires an integer duration.");
    }

    const entity = {
      partitionKey: data.profileId,
      rowKey: data.id || uuidv4(),
      profileId: data.profileId,
      questionId: data.questionId,
      answerText: data.answerText ?? null,
      optionId: data.optionId ?? null,
      duration: data.duration,
      createdAt: data.createdAt || new Date(),
    };

    return createTableEntity(tableClient, entity);
  },

  async findByPk(profileId, answerId) {
    return getTableEntity(tableClient, profileId, answerId);
  },

  async findAll(filter = {}) {
    const where = typeof filter === "object" ? filter.where ?? filter : {};
    const filters = [];

    if (typeof filter === "string" && filter.trim()) {
      filters.push(filter.trim());
    } else {
      if (where.profileId) {
        filters.push(`PartitionKey eq '${escapeTableFilterValue(where.profileId)}'`);
      }
      if (where.id || where.rowKey) {
        filters.push(`RowKey eq '${escapeTableFilterValue(where.id ?? where.rowKey)}'`);
      }
      if (where.questionId) {
        filters.push(`questionId eq '${escapeTableFilterValue(where.questionId)}'`);
      }
    }

    return listTableEntities(tableClient, filters.join(" and "));
  },

  async update(data) {
    const profileId = data?.profileId ?? data?.partitionKey;
    const answerId = data?.id ?? data?.rowKey;
    if (!profileId || !answerId) {
      throw new Error("QuestionAnswer update requires profileId and id.");
    }

    const existing = await this.findByPk(profileId, answerId);
    if (!existing) return null;

    const duration = Object.hasOwn(data, "duration") ? data.duration : existing.duration;
    if (!Number.isInteger(duration)) {
      throw new Error("QuestionAnswer update requires an integer duration.");
    }

    const entity = {
      partitionKey: profileId,
      rowKey: answerId,
      profileId,
      questionId: data.questionId ?? existing.questionId,
      answerText: Object.hasOwn(data, "answerText") ? data.answerText : existing.answerText ?? null,
      optionId: Object.hasOwn(data, "optionId") ? data.optionId : existing.optionId ?? null,
      duration,
      createdAt: existing.createdAt || new Date(),
      updatedAt: new Date(),
    };

    return updateTableEntity(tableClient, entity);
  },

  async delete(profileId, answerId) {
    return deleteTableEntity(tableClient, profileId, answerId);
  },
});
