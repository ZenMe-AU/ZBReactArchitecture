/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import * as answerRepository from "../dist/repository/table/answerRepository.mjs";
import * as questionRepository from "../dist/repository/table/questionRepository.mjs";
import * as workflowRepository from "../dist/repository/table/workflowRepository.mjs";
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
  const qty = await getEventByCorrelationId(name, correlationId);
  return { return: { qty } };
}

/**
 * Retrieve events by their correlation ID.
 * @param {string} name - Name of the event.
 * @param {string} correlationId - Correlation ID for the events.
 * @returns {Promise<any[]>} List of matching events.
 */
async function getEventByCorrelationId(name, correlationId) {
  if (name !== cmdName.FollowUpCmd && name !== cmdName.QuestionShareCmd) {
    throw new Error(`Unknown eventName: ${name}`);
  }
  try {
    return await workflowRepository.countEvents(name, correlationId);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to get event by correlationId: ${correlationId}; ${err.message}`, { cause: err });
  }
}

// TODO: Add swagger definition
async function SendFollowUpCmd(request, context) {
  const { correlationId, clientParams: body } = request;
  const profileId = request.userData.profileId;
  const cmd = await insertFollowUpCmd(profileId, body, correlationId);
  const filters = insertFollowUpFilter(cmd, body);
  const receiverIds = getFollowUpReceiver(profileId, body);
  const sharedQuestions = shareQuestion(body["newQuestionId"], profileId, await receiverIds);

  const settled = await Promise.allSettled([filters, sharedQuestions]);
  const errors = settled.filter((result) => result.status === "rejected").map((result) => result.reason);

  if (errors.length > 0) {
    throw new Error("Operations failed: " + errors.map((e) => e.message || e).join("; "));
  }

  await updateFollowUpCmdStatus(cmd);
  return { return: true };
}

/**
 * Insert a new follow-up command.
 * @param {string} senderId - Identifier of the sender.
 * @param {any} cmdData - Data for the follow-up command.
 * @param {string} correlationId - Identifier for correlating the command.
 * @returns {Promise<any>} The created follow-up command.
 */
async function insertFollowUpCmd(senderId, cmdData, correlationId) {
  try {
    return await workflowRepository.createCommand(cmdName.FollowUpCmd, senderId, cmdData, correlationId);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to insert follow-up command; ${err.message}`, { cause: err });
  }
}

/**
 * Insert a new follow-up filter.
 * @param {object} command - The follow-up command.
 * @param {any} cmdData - Data for the follow-up filter.
 * @returns {Promise<any[]>} List of created follow-up filters.
 */
async function insertFollowUpFilter(command, cmdData) {
  if (!cmdData.isSave) return;
  return workflowRepository.createFollowUpFilters(
    cmdData.question.map((filter, i) => ({
      id: command.id,
      order: i + 1,
      senderProfileId: command.senderProfileId,
      refQuestionId: filter.questionId,
      refOption: filter.option,
      newQuestionId: cmdData.newQuestionId,
    }))
  );
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
    }, filterReceiverIdAry[0] ?? []);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve follow-up receivers; ${err.message}`, { cause: err });
  }
}

/**
 * Update the status of a follow-up command.
 * @param {object} command - The follow-up command returned by insertFollowUpCmd.
 * @returns {Promise<void>}
 */
async function updateFollowUpCmdStatus(command) {
  try {
    return await workflowRepository.completeCommand(command);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to update follow-up command status; ${err.message}`, { cause: err });
  }
}

// TODO: Add swagger definition
async function ShareQuestionCmd(request, context) {
  const { correlationId, clientParams: body } = request;
  const profileId = request.userData.profileId;
  const cmd = await insertQuestionShareCmd(profileId, body, correlationId);
  const sharedQuestions = await shareQuestion(body["newQuestionId"], profileId, body["receiverIds"]);

  await updateQuestionShareCmdStatus(cmd);
  return { return: true };
}

async function ShareQuestionById(request, context) {
  await shareQuestion(request.params.id, request.userData.profileId, request.clientParams.receiverIds ?? []);
  return { return: true };
}

async function GetSharedQuestionListByUser(request, context) {
  return { return: { list: await questionRepository.getSharedQuestionListByProfileId(request.userData.profileId) } };
}

/**
 * Share a question with multiple receivers.
 * @param {string} newQuestionId - Identifier of the new question.
 * @param {string} senderId - Identifier of the sender.
 * @param {string[]} receiverIds - List of receiver identifiers.
 * @returns {Promise<void>}
 */
async function shareQuestion(newQuestionId, senderId, receiverIds) {
  try {
    console.log("shareQuestion data:", newQuestionId, senderId, receiverIds);
    return await questionRepository.shareQuestion(newQuestionId, senderId, receiverIds);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to share question from senderId ${senderId} to receiversIds ${receiverIds.join(", ")}; ${err.message}`, { cause: err });
  }
}

/**
 * Retrieve a list of answers for a specific question.
 * @param {string} questionId - Identifier of the question.
 * @returns {Promise<any[]>} List of matching answers.
 */
async function getAnswerListByQuestionId(questionId) {
  try {
    return await answerRepository.getAnswerListByQuestionId(questionId);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve answers for questionId: ${questionId}; ${err.message}`, { cause: err });
  }
}

async function insertQuestionShareCmd(senderId, cmdData, correlationId) {
  try {
    return await workflowRepository.createCommand(cmdName.QuestionShareCmd, senderId, cmdData, correlationId);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to insert question share command; ${err.message}`, { cause: err });
  }
}

/**
 * Update the status of a question share command.
 * @param {object} command - The question share command returned by insertQuestionShareCmd.
 * @returns {Promise<void>}
 */
async function updateQuestionShareCmdStatus(command) {
  try {
    return await workflowRepository.completeCommand(command);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to update question share command status; ${err.message}`, { cause: err });
  }
}

export default {
  SendFollowUpCmd,
  ShareQuestionCmd,
  ShareQuestionById,
  GetSharedQuestionListByUser,
  GetEventByCorrelationId,
};
