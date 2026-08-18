/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { TableClient } from "@azure/data-tables";
import { v4 as uuidv4 } from "uuid"; //Replaces use of DataTypes.UUIDV4 to auto-generate id in original sequelise

export default (tableClient) => {
  const tableName = "FollowUpEvent";

  const FollowUpEvent = {
    /**
     * Create a new record
     * @param {Object} data - Record data
     * @param {string} data.senderProfileId
     * @param {string} data.id
     * @param {string} data.followUpId
     * @param {string} [data.correlationId]
     * @param {string} data.action
     * @param {Object|string} data.actionData - Stringified JSON data
     * @param {Object|string} data.originalData - Stringified JSON data
     * @returns {Promise<Object>} Created entity
     */
    async create(data) {
      const entity = {
        partitionKey: data.senderProfileId,
        rowKey: data.id || uuidv4(),
        followUpId: data.followUpId || "",
        correlationId: data.correlationId || "",
        action: data.action,
        actionData: typeof data.actionData == "string" ? data.actionData : JSON.stringify(data.actionData),
        originalData: typeof data.actionData == "string" ? data.actionData : JSON.stringify(data.actionData),
        status: data.status || 0,
        timestamp: new Date(),
      };

      await tableClient.createEntity(entity, { insertIfNotExists: true });
      return entity;
    },

    async findByCompositeKey(id, senderProfileId) {
      try {
        return await tableClient.getEntity(senderProfileId, id);
      } catch (error) {
        console.error("Entity not found:", error);
        return null;
      }
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
