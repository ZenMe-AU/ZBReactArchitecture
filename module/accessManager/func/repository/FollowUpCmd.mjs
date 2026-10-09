/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid"; //Replaces use of DataTypes.UUIDV4 to auto-generate id in original sequelise
import {
  createTableEntity,
  getTableEntity,
  listTableEntities,
  updateTableEntity,
  deleteTableEntity,
  serialiseJson,
} from "./tableCrud.mjs";

export default (tableClient) => {
  const FollowUpCmd = {
    /**
     * Create a new record
     * @param {Object} data Record data
     * @param {string} data.senderProfileId Profile ID used as Partition key
     * @param {string} data.id Row key with a default value auto-generated with uuidv4
     * @param {string} [data.correlationId] Correlation ID
     * @param {string} data.action Action
     * @param {Object|string} data.data Stringified JSON data
     * @returns {Promise<Object>} Created entity
     */
    async create(data) {
      const entity = {
        partitionKey: data.senderProfileId,
        rowKey: data.id || uuidv4(),
        correlationId: data.correlationId || "",
        action: data.action,
        data: serialiseJson(data.data),
        status: data.status || 0,
        timestamp: new Date(),
      };

      return createTableEntity(tableClient, entity);
    },

    /**
     * Read record by composite key
     * @param {string} id Row key
     * @param {string} senderProfileId Partition key
     * @returns {Promise<Object|null>} Entity or null
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
     * Update a record
     * @param {*} data
     * @param {*} options
     * @returns
     */
    async update(data, options = {}) {
      const entity = {
        partitionKey: data.senderProfileId,
        rowKey: data.id,
        ...data,
        data: serialiseJson(data.data),
        timestamp: new Date(),
      };

      await updateTableEntity(tableClient, entity, "Replace");

      // Hook only runs when status transitions to 1
      if (data.previousStatus !== 1 && data.status === 1) {
        await this._afterUpdateHook(entity, options);
      }

      return entity;
    },

    /**
     * Deletes a record using composite key (row key + partition key)
     * @param {*} id Row Key
     * @param {*} senderProfileId Partition key
     */
    async delete(id, senderProfileId) {
      return deleteTableEntity(tableClient, senderProfileId, id);
    },

    /**
     * Find All FollowUpCmd entities that match a filter
     * @param {*} filter
     * @returns
     */
    async findAll(filter) {
      return listTableEntities(tableClient, filter);
    },

    /**
     * Hook equivalent for afterUpdate
     * @param {*} instance
     * @param {*} options
     * @returns
     */
    async _afterUpdateHook(instance, options) {
      try {
        // Create corresponding FollowUpEvent record
        const FollowUpEventTableClient = options.FollowUpEventTableClient;
        if (!FollowUpEventTableClient) {
          console.error("FollowUpEvent table client not provided");
          return;
        }

        const event = {
          partitionKey: instance.correlationId || uuidv4(),
          rowKey: uuidv4(),
          followUpId: instance.rowKey,
          correlationId: instance.correlationId,
          action: "create",
          senderProfileId: instance.senderProfileId,
          actionData: serialiseJson(instance.data),
          originalData: null,
          timestamp: new Date(),
        };

        await createTableEntity(FollowUpEventTableClient, event);
      } catch (error) {
        console.error("Error in afterUpdate hook:", error);
      }
    },
  };

  return FollowUpCmd;
};
