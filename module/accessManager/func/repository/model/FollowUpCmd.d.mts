/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */
import { Sequelize, DataTypes, Model, ModelStatic } from "sequelize";
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
export declare class FollowUpCmd extends Model<FollowUpCmdAttributes> implements FollowUpCmdAttributes {
    id: string;
    correlationId?: string;
    senderProfileId: string;
    action: string;
    data: Record<string, unknown>;
    status: number;
    previousStatus?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default function (sequelize: Sequelize, DataTypesArg: typeof DataTypes): ModelStatic<FollowUpCmd>;
