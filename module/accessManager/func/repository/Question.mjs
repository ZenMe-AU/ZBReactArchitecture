/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import {
  createTableEntity,
  findTableEntityByRowKey,
  listTableEntities,
  getTableEntity,
  updateTableEntity,
  deleteTableEntity,
  escapeTableFilterValue,
  serialiseJson,
} from "./tableCrud.mjs";

export default (tableClient) => {
  const withId = (entity) => {
    if (!entity) return entity;

    let option = entity.option;
    if (typeof option === "string") {
      try {
        option = JSON.parse(option);
      } catch (error) {
        throw new Error(`Question ${entity.rowKey} has invalid serialized options.`, { cause: error });
      }
    }
    if (option != null && !Array.isArray(option)) {
      throw new Error(`Question ${entity.rowKey} options must be an array or null.`);
    }

    return { ...entity, id: entity.rowKey, option: option ?? null };
  };

  const Question = {
    async create(data) {
      const entity = {
        partitionKey: data.profileId,
        rowKey: data.id || uuidv4(),
        profileId: data.profileId,
        title: data.title ?? null,
        questionText: data.questionText ?? null,
        option: data.option == null ? null : serialiseJson(data.option),
        eventId: data.eventId ?? null,
        createdAt: data.createdAt || new Date(),
      };

      return createTableEntity(tableClient, entity);
    },

    async findByPk(questionId) {
      return withId(await findTableEntityByRowKey(tableClient, questionId));
    },

    async findAll(filter = {}) {
      let filterString = "";

      if (typeof filter === "string") {
        filterString = filter;
      } else if (filter && filter.where) {
        const { profileId, id } = filter.where;

        if (profileId) {
          filterString = `PartitionKey eq '${escapeTableFilterValue(profileId)}'`;
        } else if (id) {
          filterString = `RowKey eq '${escapeTableFilterValue(id)}'`;
        }
      }

      const entities = await listTableEntities(tableClient, filterString);
      return entities.map(withId);
    },

    async update(data, options = {}) {
      const questionId = data?.id ?? data?.rowKey ?? options?.where?.id;
      if (!questionId) {
        throw new Error("Question update requires an id or rowKey value.");
      }

      const existing = (await this.findByPk(questionId)) || (await getTableEntity(tableClient, data.profileId, questionId));
      if (!existing) {
        return null;
      }

      const entity = {
        partitionKey: data.profileId || existing.partitionKey,
        rowKey: questionId,
        profileId: data.profileId || existing.profileId,
        title: data.title ?? existing.title ?? null,
        questionText: data.questionText ?? existing.questionText ?? null,
        option: data.option == null ? (existing.option ?? null) : serialiseJson(data.option),
        eventId: data.eventId ?? existing.eventId ?? null,
        createdAt: existing.createdAt || new Date(),
        updatedAt: new Date(),
      };

      return updateTableEntity(tableClient, entity);
    },

    async destroy(where) {
      const ids = where && where.id ? (Array.isArray(where.id) ? where.id : [where.id]) : [];
      if (!ids.length) {
        return 0;
      }

      let deleted = 0;
      for (const id of ids) {
        const entity = await this.findByPk(id);
        if (!entity) continue;
        if (await deleteTableEntity(tableClient, entity.partitionKey, id)) {
          deleted += 1;
        }
      }
      return deleted;
    },
  };

  return Question;
};
