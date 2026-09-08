/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { DataTypes } from "@sequelize/core";
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

  Object.values(models).forEach((model) => {
    model.associate?.(models);
  });

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
