/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { DataTypes } from "sequelize";
// const { sequelize } = require("./db.js");
// const { sequelize } = require("../");
import container from "../../di/diContainer.mjs";

let models = null;
function initModels() {
  if (models) return models;
  const sequelize = container.get("db");
  const Question = sequelize.define(
    "question",
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
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      questionText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      option: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "question",
      updatedAt: false,
    }
  );

  const QuestionAnswer = sequelize.define(
    "questionAnswer",
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
      answerText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      optionId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "questionAnswer",
      updatedAt: false,
    }
  );

  const QuestionShare = sequelize.define(
    "questionShare",
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

  const FollowUpFilter = sequelize.define(
    "followUpFilter",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      order: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.SMALLINT,
      },
      senderProfileId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      refQuestionId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      refOption: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      newQuestionId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "followUpFilter",
      updatedAt: false,
      primaryKey: ["id", "order"],
    }
  );

  Question.hasMany(QuestionAnswer, { foreignKey: "questionId", sourceKey: "id" });
  Question.hasMany(QuestionShare, { foreignKey: "newQuestionId", sourceKey: "id" });
  QuestionAnswer.belongsTo(Question, { targetKey: "id", foreignKey: "questionId" });
  QuestionShare.belongsTo(Question, { targetKey: "id", foreignKey: "newQuestionId" });

  models = {
    Question,
    QuestionAnswer,
    QuestionShare,
    FollowUpFilter,
  };

  return models;
}

export default new Proxy(
  {},
  {
    get(target, prop) {
      const initialized = initModels();
      return initialized[prop];
    },
  }
);
