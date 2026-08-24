/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import Model from "../repository/model/index.mjs";

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
  const profileId = request.userData.profileId;
  const { answer = null, option = null, duration } = request.clientParams;
  const questionnaire = await addAnswerByQuestionId(questionId, profileId, duration, answer, option);
  return { return: { id: questionnaire.id } };
}

/**
 * Add an answer entry for a question.
 * @param {string} questionId - Identifier of the question.
 * @param {string} profileId - Profile that answered the question.
 * @param {number} duration - Time spent answering.
 * @param {string|null} [answer=null] - Answer text.
 * @param {string|null} [option=null] - Selected option identifier.
 * @returns {Promise<any>} Created answer model instance.
 */
async function addAnswerByQuestionId(questionId, profileId, duration, answer = null, option = null) {
  try {
    return await Model.QuestionAnswer.create({
      questionId: questionId,
      profileId: profileId,
      answerText: answer,
      optionId: option,
      duration: duration,
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to add answer for questionId: ${questionId}; ${err.message}`, { cause: err });
  }
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
  const answer = await getAnswerById(questionId, answerId);
  return { return: { detail: answer } };
}

/**
 * Retrieve a specific answer by question and answer ids.
 * @param {string} questionId - Identifier of the question.
 * @param {string} answerId - Identifier of the answer.
 * @returns {Promise<any|null>} The matching answer or null when not found.
 */
async function getAnswerById(questionId, answerId) {
  try {
    return await Model.QuestionAnswer.findOne({ where: { id: answerId, questionId: questionId } });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve answer for questionId ${questionId} and answerId ${answerId}: ${err.message}`, { cause: err });
  }
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
  const answers = await getAnswerListByQuestionId(questionId);
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

/**
 * Retrieve a list of answers for a specific question.
 * @param {string} questionId - Identifier of the question.
 * @returns {Promise<any[]>} List of matching answers.
 */
async function getAnswerListByQuestionId(questionId) {
  try {
    // return await QuestionAnswer.findAll({ where: { questionId: questionId }, order: [["createdAt", "DESC"]] });
    // return await QuestionAnswer.findAll({
    //   attributes: [
    //     "profileId",
    //     [Sequelize.fn("MAX", Sequelize.col("createdAt")), "latestCreatedAt"],
    //     [Sequelize.fn("COUNT", Sequelize.col("id")), "answerCount"],
    //     [Sequelize.literal(`FIRST_VALUE("answerText") OVER (PARTITION BY "profileId" ORDER BY "createdAt" DESC)`), "answerText"],
    //     [Sequelize.literal(`FIRST_VALUE("optionId") OVER (PARTITION BY "profileId" ORDER BY "createdAt" DESC)`), "optionId"],
    //    ],
    //   where: { questionId },
    //   group: ["profileId"],
    //   order: [[Sequelize.fn("MAX", Sequelize.col("createdAt")), "DESC"]],
    //   raw: true,
    // });
    return await Model.QuestionAnswer.sequelize.query(
      `
          SELECT DISTINCT ON ("profileId")
            "id",
            "profileId",
            "createdAt",
            COUNT("id") OVER (PARTITION BY "profileId") AS "answerCount",
            "questionId",
            "answerText",
            "optionId",
            "duration"
          FROM "questionAnswer"
          WHERE "questionId" = :questionId
          ORDER BY "profileId", "createdAt" DESC;
        `,
      {
        replacements: { questionId },
        type: Model.QuestionAnswer.sequelize.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve answers for questionId: ${questionId}; ${err.message}`, { cause: err });
  }
}

export default {
  AddAnswer,
  GetAnswerById,
  GetAnswerListByQuestionId,
};
