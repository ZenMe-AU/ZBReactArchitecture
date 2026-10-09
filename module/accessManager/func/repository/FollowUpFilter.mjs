/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import { serialiseJson } from "./tableCrud.mjs";

export default (tableClient) => {
  const FollowUpFilter = {
    /**
     * Create a FollowUpFilter entity
     * @param {*} data
     */
    async create(data) {
      const entity = {
        partitionKey: data.id || uuidv4(),
        rowKey: String(data.order),
        senderProfileId: data.senderProfileId,
        refQuestionId: data.refQuestionId,
        refOption: serialiseJson(data.refOption),
        newQuestionId: data.newQuestionId,
        createdAt: data.createdAt || new Date(),
      };

      await tableClient.createEntity(entity);
      return entity;
    },

    /**
     * Find FollowUpFilter entity by its composite key
     * @param {*} id Partition key
     * @param {*} order Row key
     */
    async findByCompositeKey(id, order) {
      try {
        return await tableClient.getEntity(String(id), String(order));
      } catch (error) {
        if (error.statusCode === 404) return null;
        throw error;
      }
    },

    /**
     *
     * @param {*} filter
     * @returns
     */
    async findAll(filter) {
      const entities = [];

      for await (const entity of tableClient.listEntities({
        queryOptions: { filter },
      })) {
        entities.push(entity);
      }
      return entities;
    },

    /**
     *
     * @param {*} data
     */
    async update(data) {
      const entity = {
        partitionKey: String(data.id),
        rowKey: String(data.order),
        senderProfileId: data.senderProfileId,
        refQuestionId: data.refQuestionId,
        refOption: serialiseJson(data.refOption),
        newQuestionId: data.newQuestionId,
        createdAt: data.createdAt,
      };
    },

    /**
     *
     * @param {*} id
     * @param {*} order
     */
    async delete(id, order) {
      await tableClient.deleteEntity(String(id), String(order));
    },
  };
  return FollowUpFilter;
};
