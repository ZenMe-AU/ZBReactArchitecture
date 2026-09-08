/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { TableClient } from "@azure/data-tables";

import { DataTypes } from "sequelize";
import container from "../../di/diContainer.mjs";
import questionModel from "./Question.mjs";
import questionAnswerModel from "./QuestionAnswer.mjs";
import questionShareModel from "./QuestionShare.mjs";
import questionLogModel from "./QuestionLog.mjs";
import questionActionModel from "./QuestionAction.mjs";
import followUpCmdModel from "./FollowUpCmd.mjs";
import followUpFilterModel from "./FollowUpFilter.mjs";
import followUpEventModel from "./FollowUpEvent.mjs";
import questionShareCmdModel from "./QuestionShareCmd.mjs";
import questionShareEventModel from "./QuestionShareEvent.mjs";
import profileModel from "./Profile.mjs";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not configured");
}

const tableClients = {
  Question: TableClient.fromConnectionString(connectionString, "Question"),
  QuestionAnswer: TableClient.fromConnectionString(connectionString, "QuestionAnswer"),
  QuestionShare: TableClient.fromConnectionString(connectionString, "QuestionShare"),
  QuestionLog: TableClient.fromConnectionString(connectionString, "QuestionLog"),
  QuestionAction: TableClient.fromConnectionString(connectionString, "QuestionAction"),
  FollowUpCmd: TableClient.fromConnectionString(connectionString, "FollowUpCmd"),
  FollowUpFilter: TableClient.fromConnectionString(connectionString, "FollowUpFilter"),
  FollowUpEvent: TableClient.fromConnectionString(connectionString, "FollowUpEvent"),
  QuestionShareCmd: TableClient.fromConnectionString(connectionString, "QuestionShareCmd"),
  QuestionShareEvent: TableClient.fromConnectionString(connectionString, "QuestionShareEvent"),
  Profile: TableClient.fromConnectionString(connectionString, "Profile"),
};

let models;

function initModels() {
  if (models) return models;

  const Question = questionModel(tableClients.Question);
  const QuestionAnswer = questionAnswerModel(tableClients.QuestionAnswer);
  const QuestionShare = questionShareModel(tableClients.QuestionShare);
  const QuestionLog = questionLogModel(tableClients.QuestionLog);

  const QuestionAction = questionActionModel(tableClients.QuestionAction, Question);

  const FollowUpCmd = followUpCmdModel(tableClients.FollowUpCmd);
  const FollowUpFilter = followUpFilterModel(tableClients.FollowUpFilter);
  const FollowUpEvent = followUpEventModel(tableClients.FollowUpEvent);

  const QuestionShareCmd = questionShareCmdModel(tableClients.QuestionShareCmd);
  const QuestionShareEvent = questionShareEventModel(tableClients.QuestionShareEvent);
  const Profile = profileModel(tableClients.Profile);

  models = {
    Question,
    QuestionAnswer,
    QuestionShare,
    QuestionLog,
    QuestionAction,
    FollowUpCmd,
    FollowUpFilter,
    FollowUpEvent,
    QuestionShareCmd,
    QuestionShareEvent,
    Profile,
  };

  return models;
}

export default new Proxy(
  {},
  {
    get(target, property) {
      return initModels()[property];
    },
  }
);

/*
let models = null;
function initModels() {
  if (models) return models;
  const sequelize = container.get("db");
  const Question = questionModel(sequelize, DataTypes);
  const QuestionAnswer = questionAnswerModel(sequelize, DataTypes);
  const QuestionShare = questionShareModel(sequelize, DataTypes);
  const QuestionLog = questionLogModel(sequelize, DataTypes);
  const QuestionAction = questionActionModel(sequelize, DataTypes);
  const FollowUpCmd = followUpCmdModel(sequelize, DataTypes);
  const FollowUpFilter = followUpFilterModel(sequelize, DataTypes);
  const FollowUpEvent = followUpEventModel(sequelize, DataTypes);
  const QuestionShareCmd = questionShareCmdModel(sequelize, DataTypes);
  const QuestionShareEvent = questionShareEventModel(sequelize, DataTypes);
  const Profile = profileModel(sequelize, DataTypes);
  Question.hasMany(QuestionAnswer, { foreignKey: "questionId", sourceKey: "id" });
  Question.hasMany(QuestionShare, { foreignKey: "newQuestionId", sourceKey: "id" });
  QuestionAnswer.belongsTo(Question, { targetKey: "id", foreignKey: "questionId" });
  QuestionShare.belongsTo(Question, { targetKey: "id", foreignKey: "newQuestionId" });

  models = {
    Question,
    QuestionAnswer,
    QuestionShare,
    QuestionLog,
    QuestionAction,
    FollowUpCmd,
    FollowUpFilter,
    FollowUpEvent,
    // FollowUpShare,
    QuestionShareCmd,
    QuestionShareEvent,
    Profile,
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
); */
