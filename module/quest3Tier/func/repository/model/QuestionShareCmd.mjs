/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export default (sequelize, DataTypes) => {
  const QuestionShareCmd = sequelize.define(
    "QuestionShareCmd",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      senderProfileId: {
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
      tableName: "questionShareCmd",
      timestamps: true,
    }
  );

  QuestionShareCmd.addHook("afterUpdate", async (instance, options) => {
    try {
      if (instance.previousStatus !== 1 && instance.status === 1) {
        const { QuestionShareEvent } = instance.sequelize.models;
        if (!QuestionShareEvent) {
          console.error("QuestionShareEvent model not found.");
          return;
        }

        await QuestionShareEvent.create(
          {
            questionShareId: instance.id,
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

  return QuestionShareCmd;
};
