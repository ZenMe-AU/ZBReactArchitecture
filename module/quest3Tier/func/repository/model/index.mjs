/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { DataTypes } from "sequelize";
// const { sequelize } = require("./db.js");
// const { sequelize } = require("../");
import fastJsonPatch from "fast-json-patch";
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
  Question.hasMany(QuestionAnswer, { foreignKey: "questionId", sourceKey: "id" });
  Question.hasMany(QuestionShare, { foreignKey: "newQuestionId", sourceKey: "id" });
  QuestionAnswer.belongsTo(Question, { targetKey: "id", foreignKey: "questionId" });
  QuestionShare.belongsTo(Question, { targetKey: "id", foreignKey: "newQuestionId" });

  // hook
  Question.addHook("afterSave", async (instance, options) => {
    if (!instance.changed("eventId")) {
      const isCreate = instance._options.isNewRecord;
      const log = await QuestionLog.create(
        {
          questionId: instance.id,
          profileId: instance.profileId,
          actionData: instance.dataValues,
          action: isCreate ? "create" : "update",
          originalData: isCreate ? null : instance._previousDataValues,
          lastEventId: isCreate ? null : instance._previousDataValues.eventId,
        },
        {
          transaction: options.transaction,
        }
      );
      // instance.eventId = log.id;
      // await instance.save();
      await instance.update({ eventId: log.id });
      // } else {
      //   console.log(instance);
    }
  });

  QuestionAction.addHook("afterSave", async (instance, options) => {
    try {
      const { questionId, action } = instance;
      const question = await Question.findByPk(questionId);
      if (!question) {
        console.error(`Question with ID ${questionId} not found.`);
        return;
      }
      // Apply patches to the question
      const updatedData = fastJsonPatch.applyPatch(question.toJSON(), action).newDocument;
      await question.update({
        title: updatedData.title ?? null,
        questionText: updatedData.questionText ?? null,
        option: updatedData.option ?? null,
      });
      console.log(`Question with ID ${questionId} updated successfully.`);
    } catch (error) {
      console.error("Error processing afterSave hook:", error);
    }
  });

  // QuestionShare.addHook("afterBulkCreate", async (instances, options) => {
  //   try {
  //     instances.map(async (instance) => {
  //       await QuestionShareEvent.create(
  //         {
  //           questionShareId: instance.id,
  //           // correlationId: instance.correlationId,
  //           action: "create",
  //           // todo: fix
  //           // senderProfileId: instance.senderProfileId,
  //           senderProfileId: instance.senderId,
  //           actionData: instance.dataValues,
  //           originalData: null,
  //         },
  //         {
  //           transaction: options.transaction,
  //         }
  //       );
  //     });
  //   } catch (error) {
  //     console.error("Error processing afterBulkCreate hook:", error);
  //   }
  // });

  QuestionShareCmd.addHook("afterUpdate", async (instance, options) => {
    try {
      if (instance.previousStatus !== 1 && instance.status === 1) {
        await QuestionShareEvent.create(
          {
            questionShareId: instance.id,
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

  FollowUpCmd.addHook("afterUpdate", async (instance, options) => {
    try {
      if (instance.previousStatus !== 1 && instance.status === 1) {
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
);
