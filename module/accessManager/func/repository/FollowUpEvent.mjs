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
  serialiseJson,
} from "./tableCrud.mjs";

export default (tableClient) => {
  const FollowUpEvent = {
    /**
     * Create a new FollowUpEvent record
     * @param {Object} data Record data
     * @param {string} data.senderProfileId Partition key
     * @param {string} data.id row key
     * @param {string} data.followUpId
     * @param {string} [data.correlationId]
     * @param {string} data.action
     * @param {Object|string} data.actionData Stringified JSON data
     * @param {Object|string} data.originalData Stringified JSON data
     * @returns {Promise<Object>} Created entity
     */
    async create(data) {
      const entity = {
        partitionKey: data.senderProfileId,
        rowKey: data.id || uuidv4(),
        followUpId: data.followUpId,
        correlationId: data.correlationId ?? null,
        action: data.action,
        actionData: serialiseJson(data.actionData),
        originalData: serialiseJson(data.originalData),
        createdAt: data.createdAt || new Date(),
      };

      return createTableEntity(tableClient, entity);
    },

    /**
     * Find FollowUpEvent entity by composite key
     * @param {*} id
     * @param {*} senderProfileId
     * @returns
     */
    async findByCompositeKey(id, senderProfileId) {
      try {
        return await getTableEntity(tableClient, senderProfileId, id);
      } catch (error) {
        console.error("Entity not found:", error);
        return null;
      }
    },

    /**
     * Find All FollowUpEvent entities that match a filter
     * @param {*} filter
     * @returns
     */
    async findAll(filter) {
      return listTableEntities(tableClient, filter);
    },

    /**
     * Updates a FollowUpEvent entity
     * @param {*} data
     * @returns
     */
    async update(data) {
      const entity = {
        partitionKey: data.senderProfileId,
        rowKey: data.id,
        followUpId: data.followUpId,
        correlationId: data.correlationId ?? null,
        action: data.action,
        actionData: serialiseJson(data.actionData),
        originalData: serialiseJson(data.originalData),
        createdAt: data.createdAt,
      };
      return updateTableEntity(tableClient, entity);
    },

    /**
     * Deletes a FollowUpEvent entity
     * @param {*} id
     * @param {*} senderProfileId
     */
    async delete(id, senderProfileId) {
      return deleteTableEntity(tableClient, senderProfileId, id);
    },
  };
  return FollowUpEvent;
};
