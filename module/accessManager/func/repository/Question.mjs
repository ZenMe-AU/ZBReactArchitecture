/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";

const saferStringify = (value) => (typeof value === "string" ? value : JSON.stringify(value));

export default (tableClient) => {
  const Question = {
    async create(data) {
      const entity = {
        partitionKey: data.profileId,
        rowKey: data.id || uuidv4(),
        profileId: data.profileId,
        title: data.title ?? null,
        questionText: data.questionText ?? null,
        option: data.option == null ? null : saferStringify(data.option),
        eventId: data.eventId ?? null,
        createdAt: data.createdAt || new Date(),
      };

      await tableClient.createEntity(entity);
      return entity;
    },

    async findByPk(questionId) {
      const entities = [];

      for await (const entity of tableClient.listEntities({
        queryOptions: {
          filter: `RowKey eq '${questionId}'`,
        },
      })) {
        entities.push(entity);
      }

      return entities[0] ?? null;
    },

    async findAll(filter = {}) {
      const queryOptions = {};

      if (typeof filter === "string") {
        queryOptions.filter = filter;
      } else if (filter && filter.where) {
        const { profileId, id } = filter.where;

        if (profileId) {
          queryOptions.filter = `PartitionKey eq '${profileId}'`;
        } else if (id) {
          queryOptions.filter = `RowKey eq '${id}'`;
        }
      }

      const entities = [];
      for await (const entity of tableClient.listEntities({ queryOptions: Object.keys(queryOptions).length ? queryOptions : undefined })) {
        entities.push(entity);
      }

      return entities;
    },

    async update(data, options = {}) {
      const questionId = data?.id ?? data?.rowKey ?? options?.where?.id;
      if (!questionId) {
        throw new Error("Question update requires an id or rowKey value.");
      }

      const existing = (await this.findByPk(questionId)) || (await tableClient.getEntity(data.profileId, questionId));
      if (!existing) {
        return null;
      }

      const entity = {
        partitionKey: data.profileId || existing.partitionKey,
        rowKey: questionId,
        profileId: data.profileId || existing.profileId,
        title: data.title ?? existing.title ?? null,
        questionText: data.questionText ?? existing.questionText ?? null,
        option: data.option == null ? (existing.option ?? null) : saferStringify(data.option),
        eventId: data.eventId ?? existing.eventId ?? null,
        createdAt: existing.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await tableClient.updateEntity(entity, "Merge");
      return entity;
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
        await tableClient.deleteEntity(entity.partitionKey, id);
        deleted += 1;
      }
      return deleted;
    },
  };

  return Question;
};
