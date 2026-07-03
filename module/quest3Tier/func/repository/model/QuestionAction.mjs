/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export default (sequelize, DataTypes) => {
  const QuestionAction = sequelize.define(
    "QuestionAction",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      profileId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      questionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      action: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "questionAction",
      updatedAt: false,
    }
  );
  return QuestionAction;
};
