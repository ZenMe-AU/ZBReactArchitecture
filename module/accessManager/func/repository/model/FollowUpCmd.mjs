/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { TableClient } from "@azure/data-tables";
import { v4 as uuidv4 } from "uuid"; //Replaces use of DataTypes.UUIDV4 to auto-generate id in original sequelise

export default (tableClient) => {
  const tableName = "FollowUpCmd";

  const FollowUpCmd = {
    /**
     * Create a new record
     * @param {Object} data - Record data
     * @param {string} data.senderProfileId - Profile ID used as Partition key
     * @param {string} data.id - Row key with a default value auto-generated with uuidv4
     * @param {string} [data.correlationId] - Correlation ID
     * @param {string} data.action - Action
     * @param {Object|string} data.data - Stringified JSON data
     * @returns {Promise<Object>} Created entity
     */
    async create(data) {
      const entity = {
        partitionKey: data.senderProfileId,
        rowKey: data.id || uuidv4(),
        correlationId: data.correlationId || "",
        action: data.action,
        data: JSON.stringify(data.data),
        status: data.status || 0,
        timestamp: new Date(),
      };

      await tableClient.createEntity(entity, { insertIfNotExists: true });
      return entity;
    },

    /**
     * Read record by composite key
     * @param {string} id - Row key
     * @param {string} senderProfileId - Partition key
     * @returns {Promise<Object|null>} Entity or null
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
        data: typeof data.data === "string" ? data.data : JSON.stringify(data.data),
        timestamp: new Date(),
      };

      await tableClient.updateEntity(entity, "Replace");

      // Hook only runs when status transitions to 1
      if (data.previousStatus !== 1 && data.status === 1) {
        await this._afterUpdateHook(entity, options);
      }

      return entity;
    },

    /**
     * Deletes a record using composite key (row key + partition key)
     * @param {*} id - Row Key
     * @param {*} senderProfileId - Partition key
     */
    async delete(id, senderProfileId) {
      await tableClient.deleteEntity(senderProfileId, id);
    },

    // Query records
    async findAll(filter = "") {
      const entities = [];
      for await (const entity of tableClient.listEntities({ filter })) {
        entities.push(entity);
      }
      return entities;
    },

    // Hook equivalent for afterUpdate
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
          actionData: JSON.stringify(instance.data),
          originalData: null,
          timestamp: new Date(),
        };

        await FollowUpEventTableClient.createEntity(event);
      } catch (error) {
        console.error("Error in afterUpdate hook:", error);
      }
    },
  };

  return FollowUpCmd;
};

/*
export default (sequelize, DataTypes) => {
  const FollowUpCmd = sequelize.define(
    "FollowUpCmd",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      correlationId: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      senderProfileId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      action: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      status: {
        allowNull: false,
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
    },
    {
      tableName: "followUpCmd",
      timestamps: true,
    }
  );

  FollowUpCmd.addHook("afterUpdate", async (instance, options) => {
    try {
      if (instance.previousStatus !== 1 && instance.status === 1) {
        const { FollowUpEvent } = instance.sequelize.models;
        if (!FollowUpEvent) {
          console.error("FollowUpEvent model not found.");
          return;
        }

        await FollowUpEvent.create(
          {
            followUpId: instance.id,
            correlationId: instance.correlationId,
            action: "create",
            senderProfileId: instance.senderProfileId,
            actionData: instance.dataValues,
            originalData: null,
          },
          {
            transaction: options.transaction,
          }
        );
      }
    } catch (error) {
      console.error("Error processing afterUpdate hook:", error);
    }
  });

  return FollowUpCmd;
}; */
