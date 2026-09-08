/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
import { Model } from "sequelize";
export class FollowUpCmd extends Model {
}
export default function (sequelize, DataTypesArg) {
    FollowUpCmd.init({
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
    }, {
        sequelize,
        tableName: "followUpCmd",
        timestamps: true,
    });
    FollowUpCmd.addHook("afterUpdate", async (instance, options) => {
        try {
            if (instance.previousStatus !== 1 && instance.status === 1) {
                const { FollowUpEvent } = instance.sequelize.models;
                if (!FollowUpEvent) {
                    console.error("FollowUpEvent model not found.");
                    return;
                }
                await FollowUpEvent.create({
                    followUpId: instance.id,
                    correlationId: instance.correlationId,
                    action: "create",
                    senderProfileId: instance.senderProfileId,
                    actionData: instance.dataValues,
                    originalData: null,
                }, {
                    transaction: options.transaction,
                });
            }
        }
        catch (error) {
            console.error("Error processing afterUpdate hook:", error);
        }
    });
    return FollowUpCmd;
}
