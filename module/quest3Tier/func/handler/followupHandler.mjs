/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import Model from "../repository/model/index.mjs";
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

/**
 * Retrieve events by their correlation ID.
 * @param {string} name - Name of the event.
 * @param {string} correlationId - Correlation ID for the events.
 * @returns {Promise<any[]>} List of matching events.
 */
async function getEventByCorrelationId(name, correlationId) {
  let model;
  switch (name) {
    case cmdName.FollowUpCmd:
      model = Model.FollowUpEvent;
      break;
    case cmdName.QuestionShareCmd:
      model = Model.QuestionShareEvent;
      break;
    default:
      throw new Error(`Unknown eventName: ${name}`);
  }
  try {
    return await model.findAll({
      where: {
        correlationId,
      },
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to get event by correlationId: ${correlationId}; ${err.message}`, { cause: err });
  }
}

// TODO: Add swagger definition
async function SendFollowUpCmd(request, context) {
  const { correlationId, clientParams: body } = request;
  const cmd = await insertFollowUpCmd(body["profileId"], body, correlationId);
  const filters = insertFollowUpFilter(body);
  const receiverIds = getFollowUpReceiver(body);
  const sharedQuestions = shareQuestion(body["newQuestionId"], body["profileId"], await receiverIds);

  const settled = await Promise.allSettled([filters, sharedQuestions]);
  const errors = settled.filter((result) => result.status === "rejected").map((result) => result.reason);

  if (errors.length > 0) {
    throw new Error("Operations failed: " + errors.map((e) => e.message || e).join("; "));
  }

  await updateFollowUpCmdStatus(cmd["id"]);
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
    return await Model.FollowUpCmd.create({
      senderProfileId: senderId,
      action: "create",
      data: cmdData,
      correlationId: correlationId,
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to insert follow-up command; ${err.message}`, { cause: err });
  }
}

/**
 * Insert a new follow-up filter.
 * @param {any} cmdData - Data for the follow-up filter.
 * @returns {Promise<any[]>} List of created follow-up filters.
 */
async function insertFollowUpFilter(cmdData) {
  try {
    if (cmdData.save) {
      const filterId = uuidv4();
      const filterDataAry = cmdData.question.map(function (filter, i) {
        return {
          id: filterId,
          order: i + 1,
          senderProfileId: cmdData["profileId"],
          refQuestionId: filter.questionId,
          refOption: filter.option,
          newQuestionId: cmdData.newQuestionId,
        };
      });
      return await Model.FollowUpFilter.bulkCreate(filterDataAry);
    }
  } catch (err) {
    console.log(err);
  }
  return;
}

/**
 * Retrieve the list of receivers for a follow-up command.
 * @param {any} cmdData - Data for the follow-up command.
 * @returns {Promise<string[]>} List of receiver identifiers.
 */
async function getFollowUpReceiver(cmdData) {
  try {
    const filterReceiverIdAry = await Promise.all(
      cmdData.question.map(async function (filter) {
        const ansList = await getAnswerListByQuestionId(filter.questionId);
        return ansList.reduce((acc, ans) => {
          if (ans.profileId !== cmdData["profileId"] && filter.option.includes(ans.optionId)) {
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

/**
 * Update the status of a follow-up command.
 * @param {string} id - Identifier of the follow-up command.
 * @returns {Promise<any>} The updated follow-up command.
 */
async function updateFollowUpCmdStatus(id) {
  try {
    return await Model.FollowUpCmd.update({ status: 1 }, { where: { id: id }, individualHooks: true });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to update follow-up command status; ${err.message}`, { cause: err });
  }
}

// TODO: Add swagger definition
async function ShareQuestionCmd(request, context) {
  const { correlationId, clientParams: body } = request;
  const cmd = await insertQuestionShareCmd(body["profileId"], body, correlationId);
  const sharedQuestions = await shareQuestion(body["newQuestionId"], body["profileId"], body["receiverIds"]);

  await updateQuestionShareCmdStatus(cmd["id"]);
  return { return: true };
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

async function insertQuestionShareCmd(senderId, cmdData, correlationId) {
  try {
    return await Model.QuestionShareCmd.create({
      senderProfileId: senderId,
      action: "create",
      data: cmdData,
      correlationId: correlationId,
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to insert question share command; ${err.message}`, { cause: err });
  }
}

/**
 * Update the status of a question share command.
 * @param {string} id - Identifier of the question share command.
 * @returns {Promise<any>} The updated question share command.
 */
async function updateQuestionShareCmdStatus(id) {
  try {
    return await Model.QuestionShareCmd.update({ status: 1 }, { where: { id: id }, individualHooks: true });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to update question share command status; ${err.message}`, { cause: err });
  }
}

export default {
  SendFollowUpCmd,
  ShareQuestionCmd,
  GetEventByCorrelationId,
};
