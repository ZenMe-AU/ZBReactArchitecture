/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

module.exports = (sequelize, DataTypes) => {
  const QuestionShare = sequelize.define(
    "QuestionShare",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      newQuestionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      senderProfileId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      receiverProfileId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.SMALLINT,
        allowNull: false,
      },
    },
    {
      tableName: "questionShare",
      updatedAt: false,
    }
  );
  QuestionShare.associate = (models) => {
    QuestionShare.belongsTo(models.Question, { as: "Question", targetKey: "id", foreignKey: "newQuestionId" });
  };
  return QuestionShare;
};
