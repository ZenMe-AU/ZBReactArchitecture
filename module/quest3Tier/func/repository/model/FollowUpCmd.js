/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

module.exports = (sequelize, DataTypes) => {
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
  return FollowUpCmd;
};
