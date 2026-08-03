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
 * /question/{id}/share:
 *   post:
 *     tags:
 *       - Question
 *     summary: Share a question
 *     description: Share a specific question with one or more users.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the question to share.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                 type: integer
 *                 description: The ID of the sender's profile.
 *                 example: 123
 *               receiverIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: A list of profile IDs of the receivers.
 *                 example: [456, 789]
 *     responses:
 *       200:
 *         description: Successfully shared the question.
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
 *                       description: Details about the share operation.
 *                       example:
 *                         questionId: 1
 *                         senderId: 123
 *                         receivers: [456, 789]
 */
async function ShareQuestionById(request, context) {
  const { id: questionId } = request.params;
  const { profileId: senderId = null, receiverIds = [] } = request.clientParams;
  const share = await Question.shareQuestion(questionId, senderId, receiverIds);
  return { return: { detail: share } };
}

/**
 * Share a question with multiple receivers.
 * @param {string} newQuestionId - Identifier of the new question.
 * @param {string} senderId - Identifier of the sender.
 * @param {string[]} receiverIds - List of receiver identifiers.
 * @returns {Promise<any[]>} List of created sharing records.
 */
async function shareQuestion(newQuestionId, senderId, receiverIds) {
  try {
    console.log("shareQuestion data:", newQuestionId, senderId, receiverIds);
    const addData = receiverIds.map(function (receiverId) {
      return {
        newQuestionId: newQuestionId,
        senderProfileId: senderId,
        receiverProfileId: receiverId,
      };
    });
    return await Model.QuestionShare.bulkCreate(addData);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to share question from senderId ${senderId} to receiversIds ${receiverIds.join(", ")}; ${err.message}`, { cause: err });
  }
}

/**
 * @swagger
 * /profile/{profileId}/sharedQuestion:
 *   get:
 *     tags:
 *       - Question
 *     summary: Get shared questions for a user
 *     description: Retrieve the list of questions shared with the specified user.
 *     parameters:
 *       - name: profileId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 123
 *         description: The ID of the profile to retrieve shared questions for.
 *     responses:
 *       200:
 *         description: Successfully retrieved the shared questions.
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
 *                             description: The unique identifier of the shared question record.
 *                             example: "f6c1d743-a63b-4818-b75d-a62b453e6080"
 *                           questionId:
 *                             type: string
 *                             format: uuid
 *                             description: The unique identifier of the question.
 *                             example: "9f69968b-0689-435a-8694-4f9b78b87f11"
 *                           senderId:
 *                             type: integer
 *                             description: The ID of the user who shared the question.
 *                             example: 1007
 *                           receiverId:
 *                             type: integer
 *                             description: The ID of the user receiving the shared question.
 *                             example: 258
 *                           status:
 *                             type: integer
 *                             description: The status of the shared question.
 *                             example: 0
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: The timestamp when the question was shared.
 *                             example: "2025-01-03T09:46:18.739Z"
 */
async function GetSharedQuestionListByUser(request, context) {
  const { profileId } = request.params;
  const sharedQuestion = await Question.getSharedQuestionListByUser(profileId);
  return { return: { list: sharedQuestion } };
}

/**
 * @swagger
 * /sendFollowUpCmd:
 *   post:
 *     tags:
 *       - Question
 *     summary: Follow up on a question
 *     description: Create a follow-up action for a specific question.
 *     parameters:
 *       - in: header
 *         name: X-Correlation-Id
 *         required: false
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-000000000000"
 *         description: Correlation ID for tracing requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the user's profile performing the follow-up.
 *                 example: "7a232055-5355-422a-9ca7-b7e567103fd4"
 *               newQuestionId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the new question being followed up.
 *                 example: "945515c2-bf55-40f6-aba2-ae0fa0c88507"
 *               question:
 *                 type: array
 *                 description: List of questions to follow up on.
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                       format: uuid
 *                       description: The UUID of the question being followed up.
 *                       example: "12c9a107-53c2-4b77-8cf7-d58856a582da"
 *                     option:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of options related to the question.
 *                       example: ["Chushan"]
 *               isSave:
 *                 type: boolean
 *                 description: Indicates whether the follow-up should be saved.
 *                 example: true
 *               correlationId:
 *                 type: string
 *                 format: uuid
 *                 description: An optional correlation ID for tracking requests.
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 required: false
 *     responses:
 *       200:
 *         description: Successfully created a follow-up action.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the request was successful.
 *                   example: true
 *                 return:
 *                   type: boolean
 *                   description: Indicates whether the follow-up was successfully processed.
 *                   example: true
 */
// async function SendFollowUpCmdQueue(request, context) {
//   // await sendMessageToQueue(request.customParams.queueName, request.clientParams, request.correlationId);
//   // console.log("invocationId:", context.invocationId);
//   // put correlationId into service bus from ui
//   // fix this: put correlationId
//   const messageBody = {
//     body: {
//       ...(request.clientParams ?? {}),
//     },
//     correlationId: request.correlationId,
//   };
//   context.extraOutputs.set(followUpCmdQueue, messageBody);
//   return { return: true };
// }

/**
 * @swagger
 * /shareQuestionCmd:
 *   post:
 *     tags:
 *       - Question
 *     summary: Share a question
 *     description: Share a specific question with one or more users.
 *     parameters:
 *       - in: header
 *         name: X-Correlation-Id
 *         required: false
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-000000000001"
 *         description: Correlation ID for tracing requests
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the sender's profile.
 *                 example: "7a232055-5355-422a-9ca7-b7e567103fd4"
 *               newQuestionId:
 *                 type: string
 *                 format: uuid
 *                 description: The UUID of the question being shared.
 *                 example: "12c9a107-53c2-4b77-8cf7-d58856a582da"
 *               receiverIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: A list of UUIDs of the receivers.
 *                 example: ["76c527d3-9f37-4605-aac6-65527f7392da"]
 *               correlationId:
 *                 type: string
 *                 format: uuid
 *                 description: An optional correlation ID for tracking requests.
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 required: false
 *     responses:
 *       200:
 *         description: Successfully shared the question.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the request was successful.
 *                   example: true
 *                 return:
 *                   type: boolean
 *                   description: Indicates whether the question was successfully shared.
 *                   example: true
 */
// async function SendShareQuestionCmdQueue(request, context) {
//   // await sendMessageToQueue(request.customParams.queueName, request.clientParams, request.correlationId);
//   // todo:correlationId allow null
//   const messageBody = {
//     body: {
//       ...(request.clientParams ?? {}),
//     },
//     correlationId: request.correlationId,
//   };
//   context.extraOutputs.set(shareQuestionCmdQueue, messageBody);
//   return { return: true };
// }

/**
 * @swagger
 * /getEventByCorrelationId/{name}/{correlationId}:
 *   get:
 *     tags:
 *       - Event
 *     summary: Get event by correlation ID
 *     description: Retrieve event details based on the event name and correlation ID.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [FollowUpCmd, ShareQuestionCmd]
 *         description: The event name (must be one of the predefined command names).
 *         example: "FollowUpCmd"
 *       - name: correlationId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID correlation ID of the event.
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Successfully retrieved event details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                   example: true
 *                 return:
 *                   type: object
 *                   properties:
 *                     qty:
 *                       type: integer
 *                       description: The quantity of items.
 *                       example: 5
 */
async function GetEventByCorrelationId(request, context) {
  const { name, correlationId } = request.params;
  const result = await Question.getEventByCorrelationId(name, correlationId);
  return { return: { qty: result.length } };
}

async function SendFollowUpCmd(request, context) {
  const { correlationId, clientParams: body } = request;
  const cmd = await Question.insertFollowUpCmd(body["profileId"], body, correlationId);
  const filters = Question.insertFollowUpFilter(body);
  const receiverIds = Question.getFollowUpReceiver(body);
  const sharedQuestions = Question.shareQuestion(body["newQuestionId"], body["profileId"], await receiverIds);

  const settled = await Promise.allSettled([filters, sharedQuestions]);
  const errors = settled.filter((result) => result.status === "rejected").map((result) => result.reason);

  if (errors.length > 0) {
    throw new Error("Operations failed: " + errors.map((e) => e.message || e).join("; "));
  }

  await Question.updateFollowUpCmdStatus(cmd["id"]);
  return { return: true };
}

async function ShareQuestionCmd(request, context) {
  const { correlationId, clientParams: body } = request;
  const cmd = await Question.insertQuestionShareCmd(body["profileId"], body, correlationId);
  const sharedQuestions = await Question.shareQuestion(body["newQuestionId"], body["profileId"], body["receiverIds"]);

  await Question.updateQuestionShareCmdStatus(cmd["id"]);
  return { return: true };
}

export default {
  ShareQuestionById,
  GetSharedQuestionListByUser,
  SendFollowUpCmd,
  ShareQuestionCmd,
  GetEventByCorrelationId,
};
