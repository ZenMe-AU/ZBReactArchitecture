/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// This is the repository layer for managing question-related models and their interactions with the database.
// TODO: Rename this file to repository.ts and move it to the repository layer folder.

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
import { Question } from "../interfaces.js";

let models: Record<string, any> | null = null;

export function initRepository(sequelize) {
  if (models) return models;
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
    QuestionShareCmd,
    QuestionShareEvent,
    Profile,
  };

  Object.values(models).forEach((model) => {
    model.associate?.(models);
  });

  return models;
}

export async function getById(questionId: string): Promise<Question | null> {
  try {
    const question = await models.Question.findByPk(questionId);
    if (!question) {
      return null;
    }
    const { id, title, questionText, option, profileId } = question.dataValues;
    return { id, title, questionText, option, profileId };
  } catch (err) {
    console.log(err);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to retrieve question for questionId: ${questionId}; ${message}`, { cause: err });
  }
}
