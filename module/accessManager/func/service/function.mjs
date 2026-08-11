/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Op, Sequelize } from "sequelize";
// const { Op } = require("../shared/db").sequelize;

// const {
//   Question,
//   QuestionAnswer,
//   QuestionShare,
//   QuestionShareCmd,
//   QuestionAction,
//   FollowUpCmd,
//   FollowUpFilter,
//   FollowUpEvent,
//   QuestionShareEvent,
// } = require("../db/model");
import Model from "../repository/model/index.mjs";
import { v4 as uuidv4 } from "uuid";
import cmdName from "../enum/cmdName.mjs";

/**
 * Create a new question record.
 * @param {string} profileId - Owner profile identifier.
 * @param {string|null} [title=null] - Question title.
 * @param {string|null} [question=null] - Question body text.
 * @param {string|null} [option=null] - Question option metadata.
 * @returns {Promise<any>} Created question model instance.
 */
async function create(profileId, title = null, question = null, option = null) {
  try {
    return await Model.Question.create({
      profileId: profileId,
      title: title,
      questionText: question,
      option: option,
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to create question for profileId: ${profileId}; ${err.message}`, { cause: err });
  }
}

/**
 * Update a question by its id.
 * @param {string} questionId - Identifier of the question to update.
 * @param {string|null} [title=null] - New question title.
 * @param {string|null} [questionText=null] - New question text.
 * @param {string|null} [option=null] - Updated option metadata.
 * @returns {Promise<any>} Result of the update operation.
 */
async function updateById(questionId, title = null, questionText = null, option = null) {
  try {
    return await Model.Question.update(
      {
        title: title,
        questionText: questionText,
        option: option,
      },
      {
        where: {
          id: questionId,
        },
        individualHooks: true,
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to update question for questionId: ${questionId}; ${err.message}`, { cause: err });
  }
}

/**
 * Retrieve a question by its primary key.
 * @param {string} questionId - Question identifier.
 * @returns {Promise<any|null>} The found question or null when not found.
 */
async function getById(questionId) {
  try {
    // return await Questionnaires.findOne({ where: { id: questionId } });
    return await Model.Question.findByPk(questionId);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve question for questionId: ${questionId}; ${err.message}`, { cause: err });
  }
}

/**
 * Retrieve all questions created by a user.
 * @param {string} profileId - Profile identifier.
 * @returns {Promise<Array<any>>} List of questions for the profile.
 */
async function getListByUser(profileId) {
  try {
    return await Model.Question.findAll({ where: { profileId: profileId } });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve questions for profileId: ${profileId}; ${err.message}`, { cause: err });
  }
}

/**
 * Retrieve questions belonging to a user or shared with a user.
 * @param {string} profileId - Profile identifier.
 * @returns {Promise<Array<any>>} Combined list of owned or shared questions.
 */
async function getCombinationListByUser(profileId) {
  try {
    return await Model.Question.findAll({
      where: {
        [Op.or]: [
          { profileId: profileId },
          {
            "$QuestionShares.receiverProfileId$": profileId,
          },
        ],
      },
      include: [
        {
          model: Model.QuestionShare,
          attributes: [],
          group: ["newQuestionId"],
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve questions for profileId: ${profileId}; ${err.message}`, { cause: err });
  }
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
 * Add follow-up questions based on a specific question ID.
 * @param {string} newQuestionId - Identifier of the new question.
 * @param {string} senderId - Identifier of the sender.
 * @param {any[]} questionList - List of questions to follow up on.
 * @param {boolean} isSave - Flag indicating whether to save the follow-up.
 * @returns {Promise<any[]>} List of created follow-up records.
 */
async function addFollowUpByQuestionId(newQuestionId, senderId, questionList, isSave) {
  try {
    const addData = questionList.map(function (question) {
      return {
        senderProfileId: senderId,
        refQuestionId: question.questionId,
        refOption: question.option,
        newQuestionId: newQuestionId,
        isSave: isSave,
      };
    });
    const list = await Model.FollowUpCmd.bulkCreate(addData);
    // await followUpCmdQueue.add("processFollowUpCmd", { tasks: list });
    // console.log(list.map(({ id }) => id));
    // await followUpCmdQueue.add("processFollowUpCmd", { tasks: list.map(({ id }) => id) });
    return list;
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to add follow-up question; ${err.message}`, { cause: err });
  }
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

// async function insertFollowUpCmd(senderId, action, cmdData) {
//   try {
//     const newQuestionId = cmdData.newQuestionId;
//     const cmd = await FollowUpCmd.create({
//       senderProfileId: senderId,
//       action: action,
//       data: cmdData,
//     });
//     // save to filter
//     if (cmdData.save) {
//       const filterId = uuidv4();
//       const filterDataAry = cmdData.question.map(function (filter, i) {
//         return {
//           id: filterId,
//           order: i + 1,
//           senderProfileId: senderId,
//           refQuestionId: filter.questionId,
//           refOption: filter.option,
//           newQuestionId: newQuestionId,
//         };
//       });
//       await FollowUpFilter.bulkCreate(filterDataAry);
//     }
//     // save to share
//     const filterReceiverIdAry = await Promise.all(
//       cmdData.question.map(async function (filter) {
//         const ansList = await getAnswerListByQuestionId(filter.questionId);
//         return ansList.reduce((acc, ans) => {
//           if (ans.profileId !== senderId && filter.option.includes(ans.optionId)) {
//             acc.push(ans.profileId);
//           }
//           return acc;
//         }, []);
//       })
//     );
//     console.log(filterReceiverIdAry);
//     const receiverIds = filterReceiverIdAry.reduce((acc, arr) => {
//       const set = new Set(arr);
//       return acc.filter((item) => set.has(item));
//     });
//     console.log(receiverIds);
//     if (receiverIds.length > 0) {
//       await addShareByQuestionId(newQuestionId, senderId, receiverIds);
//       // await FollowUpShare.bulkCreate(
//       //   receiverIds.map(function (receiverId) {
//       //     return {
//       //       senderProfileId: senderId,
//       //       receiverProfileId: receiverId,
//       //       newQuestionId: newQuestionId,
//       //       // -------------------------------------
//       //       refQuestionId: senderId,
//       //     };
//       //   })
//       // );
//     }

//     // todo: enum
//     await cmd.update({ status: 1 });
//     return cmd;
//   } catch (err) {
//     console.log(err);
//     return;
//   }
// }

/**
 * Retrieve a list of shared questions for a specific user.
 * @param {string} profileId - Identifier of the user.
 * @returns {Promise<any[]>} List of shared questions.
 */
async function getSharedQuestionListByUser(profileId) {
  try {
    return await Model.QuestionShare.findAll({
      where: { receiverId: profileId },
      include: [
        {
          model: Model.Question,
          attributes: ["title", "questionText", "option"],
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve shared questions for profile: ${profileId}; ${err.message}`, { cause: err });
  }
}

/**
 * Patch a question action by its ID.
 * @param {string} profileId - Identifier of the user.
 * @param {string} action - Action type to filter the questions.
 * @param {string} questionId - Identifier of the question to filter.
 * @returns {Promise<any[]>} List of shared questions.
 */
async function patchById(questionId, action, profileId) {
  try {
    return await Model.QuestionAction.create({ questionId, profileId, action });
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to patch question by ID: ${questionId}; ${err.message}`, { cause: err });
  }
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

export default {
  create,
  updateById,
  getById,
  getListByUser,
  getCombinationListByUser,
  addAnswerByQuestionId,
  getAnswerById,
  getAnswerListByQuestionId,
  shareQuestion,
  addFollowUpByQuestionId,
  getSharedQuestionListByUser,
  patchById,
  insertFollowUpCmd,
  insertFollowUpFilter,
  getFollowUpReceiver,
  updateFollowUpCmdStatus,
  insertQuestionShareCmd,
  updateQuestionShareCmdStatus,
  getEventByCorrelationId,
};
