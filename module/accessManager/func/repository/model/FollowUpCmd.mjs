/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

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
};
