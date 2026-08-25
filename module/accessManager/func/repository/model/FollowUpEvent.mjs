/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
const saferStringify = (value) => (typeof value === "string" ? value : JSON.stringify(value));

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
        actionData: saferStringify(data.actionData),
        originalData: saferStringify(data.originalData),
        createdAt: data.createdAt || new Date(),
      };

      await tableClient.createEntity(entity);
      return entity;
    },

    /**
     * Find FollowUpEvent entity by composite key
     * @param {*} id
     * @param {*} senderProfileId
     * @returns
     */
    async findByCompositeKey(id, senderProfileId) {
      try {
        return await tableClient.getEntity(senderProfileId, id);
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
      const entities = [];
      for await (const entity of tableClient.listEntities({ filter })) {
        entities.push(entity);
      }
      return entities;
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
        actionData: typeof data.actionData == "string" ? data.actionData : JSON.stringify(data.actionData),
        originalData: typeof data.actionData == "string" ? data.actionData : JSON.stringify(data.actionData),
        createdAt: data.createdAt,
      };
      await tableClient.updateEntity(entity, "Merge");
      return entity;
    },

    /**
     * Deletes a FollowUpEvent entity
     * @param {*} id
     * @param {*} senderProfileId
     */
    async delete(id, senderProfileId) {
      await tableClient.deleteEntity(senderProfileId, id);
    },
  };
  return FollowUpEvent;
};

/*
export default (sequelize, DataTypes) => {
  const FollowUpEvent = sequelize.define(
    "FollowUpEvent",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      followUpId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      correlationId: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      action: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      senderProfileId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      originalData: {
        allowNull: true,
        type: DataTypes.JSON,
      },
      actionData: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "followUpEvent",
      updatedAt: false,
    }
  );
  return FollowUpEvent;
};*/
