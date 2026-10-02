/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import repository from "../repository/repository.mjs";

import { GetQuestionById } from "./questionGetById.mjs";

/**
 * @swagger
 * /question:
 *   post:
 *     tags:
 *       - Question
 *     summary: Create a new questionnaire
 *     description: Creates a new questionnaire for the authenticated profile.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the questionnaire.
 *                 example: "Favorite Foods"
 *               questionText:
 *                 type: string
 *                 description: The main question in the questionnaire.
 *                 example: "What is your favorite food?"
 *               option:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Options for the questionnaire (optional).
 *                 example: ["Pizza", "Burger", "Sushi"]
 *     responses:
 *       200:
 *         description: Successfully created questionnaire.
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
 *                       description: ID of the created questionnaire.
 *                       example: 123
 */
async function CreateQuestion(request, context) {
  const profileId = request.userData.profileId;
  const { title = null, option = null, questionText } = request.clientParams;
  const questionnaire = await repository.create(profileId, title, questionText, option);
  return { return: { id: questionnaire.id } };
}

/**
 * @swagger
 * /question/{id}:
 *   put:
 *     tags:
 *       - Question
 *     summary: Update a question
 *     description: Update the title, question text, or options of a specific question.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the question to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 nullable: true
 *                 description: The new title of the question (optional).
 *                 example: "Updated Favorite Foods"
 *               questionText:
 *                 type: string
 *                 description: The updated question text.
 *                 example: "What is your updated favorite food?"
 *               option:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: Updated options for the question (optional).
 *                 example: ["Pizza", "Burger", "Sushi", "Pasta"]
 *     responses:
 *       200:
 *         description: Successfully updated the question.
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
 *                       description: The ID of the updated question.
 *                       example: 1
 */
async function UpdateQuestionById(request, context) {
  const { id: questionId } = request.params;
  const { title = null, option = null, questionText } = request.clientParams;
  const question = await repository.updateById(questionId, title, questionText, option);
  return { return: { id: question.id } };
}

/**
 * @swagger
 * /question/{id}:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get questionnaire by ID
 *     description: Retrieve the details of a specific questionnaire by its ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Successfully retrieved questionnaire.
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
 *                       description: Details of the questionnaire.
 */
/**
 * @swagger
 * /profile/question:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get list of questions by user
 *     description: Retrieve all questions created by or shared with the authenticated user.
 *     responses:
 *       200:
 *         description: Successfully retrieved list of questions.
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
 *                             example: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
 *                           profileId:
 *                             type: string
 *                             format: uuid
 *                             example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
 *                           title:
 *                             type: string
 *                             example: "Favorite Foods"
 *                           question:
 *                             type: string
 *                             example: "What is your favorite food?"
 *                           option:
 *                             type: array
 *                             items:
 *                               type: string
 *                             nullable: true
 *                             example: ["Pizza", "Burger", "Sushi"]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-12-18T13:05:14.411Z"
 */
async function GetQuestionListByUser(request, context) {
  const profileId = request.userData.profileId;
  const question = await repository.getCombinationListByUser(profileId);
  return { return: { list: question } };
}

/**
 * @swagger
 * /question/{id}:
 *   patch:
 *     tags:
 *       - Question
 *     summary: Update a question using JSON Patch
 *     description: Apply JSON Patch operations to update a question's data. Changes are recorded in the question_action table.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: The UUID of the question to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json-patch+json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 op:
 *                   type: string
 *                   enum: [add, remove, replace, move, copy, test]
 *                   description: The operation to perform.
 *                 path:
 *                   type: string
 *                   description: The JSON Pointer path to the field to operate on.
 *                   example: "/title"
 *                 value:
 *                   type: string
 *                   description: The value to set (required for `add` and `replace` operations).
 *                   example: "Updated Title"
 *     responses:
 *       200:
 *         description: Successfully queued patch operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 return:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: The unique identifier of the created question_action record.
 *                       example: "b08992c2-7c89-43a6-a152-9d24a74349a7"
 */
async function PatchQuestionById(request, context) {
  const profileId = request.userData.profileId;
  const { id: questionId } = request.params;
  const questionAction = await repository.patchById(questionId, request.clientParams, profileId);
  return { return: { id: questionAction.id } };
}

export default {
  CreateQuestion,
  UpdateQuestionById,
  GetQuestionById,
  GetQuestionListByUser,
  PatchQuestionById,
};
