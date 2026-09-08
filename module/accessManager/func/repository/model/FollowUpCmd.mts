/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Sequelize, DataTypes, Model, InstanceUpdateOptions, ModelStatic } from "sequelize";

export interface FollowUpCmdAttributes {
  id: string;
  correlationId?: string;
  senderProfileId: string;
  action: string;
  data: Record<string, unknown>;
  status: number;
  previousStatus?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FollowUpCmd extends Model<FollowUpCmdAttributes> implements FollowUpCmdAttributes {
  declare id: string;
  declare correlationId?: string;
  declare senderProfileId: string;
  declare action: string;
  declare data: Record<string, unknown>;
  declare status: number;
  declare previousStatus?: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export default function (sequelize: Sequelize, DataTypesArg: typeof DataTypes): ModelStatic<FollowUpCmd> {
  FollowUpCmd.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypesArg.UUID,
        defaultValue: DataTypesArg.UUIDV4,
      },
      correlationId: {
        allowNull: true,
        type: DataTypesArg.UUID,
      },
      senderProfileId: {
        allowNull: false,
        type: DataTypesArg.UUID,
      },
      action: {
        allowNull: false,
        type: DataTypesArg.STRING,
      },
      data: {
        allowNull: false,
        type: DataTypesArg.JSON,
      },
      status: {
        allowNull: false,
        type: DataTypesArg.SMALLINT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "followUpCmd",
      timestamps: true,
    }
  );

  FollowUpCmd.addHook("afterUpdate", async (instance: FollowUpCmd, options: InstanceUpdateOptions<FollowUpCmdAttributes>) => {
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
}
