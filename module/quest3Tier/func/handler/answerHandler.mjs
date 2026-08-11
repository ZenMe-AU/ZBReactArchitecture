/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import Question from "../service/function.mjs";
import { decode } from "../service/authEntraID.mjs";
import { Op, Sequelize } from "sequelize";
import Model from "../repository/model/index.mjs";
import { v4 as uuidv4 } from "uuid";
import cmdName from "../enum/cmdName.mjs";

/**
 * @swagger
 * /question/{id}/answer:
 *   post:
 *     tags:
 *       - Question
 *     summary: Add an answer to a questionnaire
 *     description: Submit an answer to a specific questionnaire.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                 type: integer
 *                 description: ID of the profile submitting the answer.
 *                 example: 1
 *               answer:
 *                 type: string
 *                 description: The answer text (optional).
 *                 example: "Pizza"
 *               option:
 *                 type: integer
 *                 description: The selected option ID (optional).
 *                 example: 2
 *     responses:
 *       200:
 *         description: Successfully added answer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID of the created answer.
 *                       example: 456
 */
async function AddAnswer(request, context) {
  const { id: questionId } = request.params;
  const { profileId, answer = null, option = null, duration } = request.clientParams;
  const questionnaire = await Question.addAnswerByQuestionId(questionId, profileId, duration, answer, option);
  return { return: { id: questionnaire.id } };
}

/**
 * @swagger
 * /question/{id}/answer/{answerId}:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get answer by ID
 *     description: Retrieve a specific answer by its ID for a given questionnaire.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *       - name: answerId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *     responses:
 *       200:
 *         description: Successfully retrieved answer.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     detail:
 *                       type: object
 *                       description: Details of the answer.
 */
async function GetAnswerById(request, context) {
  const { id: questionId, answerId } = request.params;
  const answer = await Question.getAnswerById(questionId, answerId);
  return { return: { detail: answer } };
}

/**
 * @swagger
 * /question/{id}/answer:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get list of answers for a questionnaire
 *     description: Retrieve all answers submitted for a specific questionnaire.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "985953ea-77d4-4b64-b11c-764d51c93b73"
 *     responses:
 *       200:
 *         description: Successfully retrieved list of answers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "d520b3fb-f2ce-4d08-b865-6d813812b7c3"
 *                           profileId:
 *                             type: integer
 *                             nullable: true
 *                             example: null
 *                           questionId:
 *                             type: string
 *                             format: uuid
 *                             example: "985953ea-77d4-4b64-b11c-764d51c93b73"
 *                           answerText:
 *                             type: string
 *                             nullable: true
 *                             example: "I think it's Mandarin? Not sure if Taiwanese counts."
 *                           optionId:
 *                             type: integer
 *                             nullable: true
 *                             description: The index of the selected option (starting from 0).
 *                             example: null
 *                           duration:
 *                             type: integer
 *                             description: Time spent answering the question (in seconds).
 *                             example: 587
 *                           isEdited:
 *                             type: boolean
 *                             description: Indicates if the answer has been edited.
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-02-15T15:42:36.892Z"
 */
async function GetAnswerListByQuestionId(request, context) {
  const { id: questionId } = request.params;
  const profileId = request.userData?.profileId;
  const answers = await Question.getAnswerListByQuestionId(questionId);
  const processedAnswers = answers.map((ans) => {
    return {
      ...ans,
      isEdited: ans.answerCount > 1 ? true : false,
      profileId: ans.profileId === profileId ? ans.profileId : null,
      answerCount: undefined,
    };
  });
  console.log("processedAnswers:", processedAnswers);
  return { return: { list: processedAnswers } };
}
