/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fastJsonPatch from "fast-json-patch";

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

  QuestionAction.addHook("afterSave", async (instance) => {
    try {
      const { questionId, action } = instance;
      const { Question } = instance.sequelize.models;
      if (!Question) {
        console.error("Question model not found.");
        return;
      }

      const question = await Question.findByPk(questionId);
      if (!question) {
        console.error(`Question with ID ${questionId} not found.`);
        return;
      }

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

  return QuestionAction;
};
