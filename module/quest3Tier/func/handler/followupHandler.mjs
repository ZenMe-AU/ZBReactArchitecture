/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import * as answerRepository from "../dist/repository/table/answerRepository.mjs";
import * as questionRepository from "../dist/repository/table/questionRepository.mjs";

// TODO: Add swagger definition
async function SendFollowUpCmd(request, context) {
  const { clientParams: body } = request;
  const profileId = request.userData.profileId;
  const receiverIds = await getFollowUpReceiver(profileId, body);
  await shareQuestion(body["newQuestionId"], profileId, receiverIds);
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
    }, filterReceiverIdAry[0] ?? []);
  } catch (err) {
    console.log(err);
    throw new Error(`Failed to retrieve follow-up receivers; ${err.message}`, { cause: err });
  }
}

// TODO: Add swagger definition
async function ShareQuestionCmd(request, context) {
  const { clientParams: body } = request;
  const profileId = request.userData.profileId;
  await shareQuestion(body["newQuestionId"], profileId, body["receiverIds"]);
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

export default {
  SendFollowUpCmd,
  ShareQuestionCmd,
  ShareQuestionById,
  GetSharedQuestionListByUser,
};
