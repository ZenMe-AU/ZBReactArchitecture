/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fastJsonPatch from "fast-json-patch";
import { v4 as uuidv4 } from "uuid";
import { createTableEntity, getTableEntity, serialiseJson } from "./tableCrud.mjs";

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
        action: serialiseJson(data.action),
        createdAt: new Date(),
      };

      await createTableEntity(tableClient, entity);
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
      return getTableEntity(tableClient, profileId, id);
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
