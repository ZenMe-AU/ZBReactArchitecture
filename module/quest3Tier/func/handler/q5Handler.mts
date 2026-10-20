/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Q5 UI (quest5TierEg/ui) compatibility for the questionQry/questionCmd routes.
// The Q5 UI compares profileId with the Entra oid (externalId), sends follow-ups as
// questionIdList and patches "/optionList", so these wrap the Q3 handlers with Q5 values.

import { z } from "zod";
import { GetQuestionById } from "./question/getById.mjs";
import { GetQuestionListByUser } from "./question/getListByUser.mjs";
import { PatchQuestionById } from "./question/patchById.mjs";
import answerHandler from "./answerHandler.mjs";
import followupHandler from "./followupHandler.mjs";
import * as SendFollowUpCmd from "./SendFollowUpCmd.mjs";

export const sendFollowUpBody = SendFollowUpCmd.body
  .omit({ newQuestionId: true })
  .extend({ questionIdList: z.array(SendFollowUpCmd.body.shape.newQuestionId).min(1) })
  .meta({ id: "SendFollowUpListCmd" });

async function getQuestion(request, context) {
  const result = await GetQuestionById(request, context);
  const detail = result.return.detail;
  if (detail?.profileId === request.userData.profileId) detail.profileId = request.userData.externalId;
  return result;
}

async function getQuestions(request, context) {
  const result = await GetQuestionListByUser(request, context);
  const list = result.return.list.map((item) => ({
    ...item,
    profileId: item.profileId === request.userData.profileId ? request.userData.externalId : item.profileId,
  }));
  return { return: { list } };
}

// Same as the Q5 func: only the caller's own answers carry a profileId.
async function getAnswers(request, context) {
  const result = await answerHandler.GetAnswerListByQuestionId(request, context);
  const list = result.return.list.map((ans) => ({
    ...ans,
    profileId: ans.profileId === request.userData.profileId ? request.userData.externalId : null,
  }));
  return { return: { list } };
}

// Q3 stores the option list as "option"; optionList is the same value under the Q5 name.
async function updateQuestion(request, context) {
  request.clientParams = request.clientParams.map((op) => ({ ...op, path: op.path.replace(/^\/optionList\b/, "/option") }));
  return PatchQuestionById(request, context);
}

async function sendFollowUp(request, context) {
  const { questionIdList, ...body } = request.clientParams;
  for (const newQuestionId of questionIdList) {
    await followupHandler.SendFollowUpCmd(
      { correlationId: request.correlationId, userData: request.userData, clientParams: { ...body, newQuestionId } },
      context
    );
  }
  return { return: true };
}

export default {
  getQuestion,
  getQuestions,
  getAnswers,
  updateQuestion,
  sendFollowUp,
};
