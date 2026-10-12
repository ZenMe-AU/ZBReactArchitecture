/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { getRepository } from "../repository/getRepository.mjs";

import { GetQuestionById } from "./questionGetById.mjs";

async function CreateQuestion(request, context) {
  const repository = getRepository();
  const profileId = request.userData.profileId;
  const { title = null, option = null, questionText } = request.clientParams;
  const questionnaire = await repository.create(profileId, title, questionText, option);
  return { return: { id: questionnaire.id } };
}

async function UpdateQuestionById(request, context) {
  const repository = getRepository();
  const { id: questionId } = request.params;
  const { title = null, option = null, questionText } = request.clientParams;
  const question = await repository.updateById(questionId, title, questionText, option);
  return { return: { id: question.id } };
}

async function GetQuestionListByUser(request, context) {
  const repository = getRepository();
  const profileId = request.userData.profileId;
  const question = await repository.getCombinationListByUser(profileId);
  return { return: { list: question } };
}

async function PatchQuestionById(request, context) {
  const repository = getRepository();
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
