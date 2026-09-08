/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fastJsonPatch from "fast-json-patch";
import { v4 as uuidv4 } from "uuid";

const parseAction = (action) => (typeof action === "string" ? JSON.parse(action) : action);

export default (tableClient, Question) => {
  const QuestionAction = {
    /**
     * Create a QuestionAction and apply its patch to the Question.
     * @param {{id?: string, profileId: string, questionId: string, action: Object|string}} data
     * @returns {Promise<Object>}
     */
    async create(data) {
      const entity = {
        partitionKey: data.profileId,
        rowKey: data.id || uuidv4(),
        profileId: data.profileId,
        questionId: data.questionId,
        action: typeof data.action === "string" ? data.action : JSON.stringify(data.action),
        createdAt: new Date(),
      };

      await tableClient.createEntity(entity);
      await QuestionAction._afterSave(entity);

      return entity;
    },

    /**
     * Find a QuestionAction by composite key.
     * @param {string} profileId Partition key.
     * @param {string} id Row key.
     * @returns {Promise<Object|null>}
     */
    async findByPk(profileId, id) {
      try {
        return await tableClient.getEntity(profileId, id);
      } catch (error) {
        if (error.statusCode === 404) return null;
        throw error;
      }
    },

    /**
     * Apply the action patch to the related Question.
     * @param {Object} instance
     * @returns {Promise<void>}
     */
    async _afterSave(instance) {
      if (!Question) {
        console.error("Question model not provided.");
        return;
      }

      const question = await Question.findByPk(instance.questionId);
      if (!question) {
        console.error(`Question with ID ${instance.questionId} not found.`);
        return;
      }

      const updatedData = fastJsonPatch.applyPatch({ ...question }, parseAction(instance.action)).newDocument;

      await Question.update({
        ...question,
        title: updatedData.title ?? null,
        questionText: updatedData.questionText ?? null,
        option: updatedData.option ?? null,
      });
    },
  };

  return QuestionAction;
};

/*
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
}; */
