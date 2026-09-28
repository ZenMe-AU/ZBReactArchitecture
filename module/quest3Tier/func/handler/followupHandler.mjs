/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { v4 as uuidv4 } from "uuid";
import cmdName from "../enum/cmdName.mjs";

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
  const result = await getEventByCorrelationId(name, correlationId);
  return { return: { qty: result.length } };
}

// TODO: Add swagger definition
async function SendFollowUpCmd(request, context) {
  const { correlationId, clientParams: body } = request;
  const profileId = request.userData.profileId;
  const cmd = await insertFollowUpCmd(profileId, body, correlationId);
  const filters = insertFollowUpFilter(profileId, body);
  const receiverIds = getFollowUpReceiver(profileId, body);
  const sharedQuestions = shareQuestion(body["newQuestionId"], profileId, await receiverIds);

  const settled = await Promise.allSettled([filters, sharedQuestions]);
  const errors = settled.filter((result) => result.status === "rejected").map((result) => result.reason);

  if (errors.length > 0) {
    throw new Error("Operations failed: " + errors.map((e) => e.message || e).join("; "));
  }

  await updateFollowUpCmdStatus(cmd["id"]);
  return { return: true };
}

/**
 * Retrieve the list of receivers for a follow-up command.
 * @param {string} senderId - Identifier of the authenticated sender.
 * @param {any} cmdData - Data for the follow-up command.
 * @returns {Promise<string[]>} List of receiver identifiers.
 */
async function getFollowUpReceiver(senderId, cmdData) {
  try {
    const filterReceiverIdAry = await Promise.all(
      cmdData.question.map(async function (filter) {
        const ansList = await getAnswerListByQuestionId(filter.questionId);
        return ansList.reduce((acc, ans) => {
          if (ans.profileId !== senderId && filter.option.includes(ans.optionId)) {
            acc.push(ans.profileId);
          }
          return acc;
        }, []);
      })
    );
    console.log(filterReceiverIdAry);
    return filterReceiverIdAry.reduce((acc, arr) => {
      const set = new Set(arr);
      return acc.filter((item) => set.has(item));
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve follow-up receivers; ${err.message}`, { cause: err });
  }
}

// TODO: Add swagger definition
async function ShareQuestionCmd(request, context) {
  const { correlationId, clientParams: body } = request;
  const profileId = request.userData.profileId;
  const cmd = await insertQuestionShareCmd(profileId, body, correlationId);
  const sharedQuestions = await shareQuestion(body["newQuestionId"], profileId, body["receiverIds"]);

  await updateQuestionShareCmdStatus(cmd["id"]);
  return { return: true };
}

export default {
  SendFollowUpCmd,
  ShareQuestionCmd,
  GetEventByCorrelationId,
};
