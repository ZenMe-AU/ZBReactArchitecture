/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { questionRepository } from "../repository/tableClient.mjs";

async function CreateQuestion(request) {
  const profileId = request.userData.profileId;
  const { title = null, option = null, questionText = null } = request.clientParams;
  const question = await questionRepository.create({ profileId, title, questionText, option });

  return { return: { id: question.rowKey } };
}

async function GetQuestionById(request) {
  const question = await questionRepository.findByPk(request.params.id);
  if (!question) {
    const error = new Error(`Question not found: ${request.params.id}`);
    error.status = 404;
    throw error;
  }

  return { return: { detail: question } };
}

async function UpdateQuestionById(request) {
  const profileId = request.userData.profileId;
  const { title = null, option = null, questionText = null } = request.clientParams;
  const question = await questionRepository.update(
    {
      id: request.params.id,
      profileId,
      title,
      questionText,
      option,
    },
    { where: { id: request.params.id } }
  );

  if (!question) {
    const error = new Error(`Question not found: ${request.params.id}`);
    error.status = 404;
    throw error;
  }

  return { return: { id: question.rowKey } };
}

async function GetQuestionListByUser(request) {
  const questions = await questionRepository.findAll({
    where: { profileId: request.userData.profileId },
  });

  return { return: { list: questions } };
}

export default {
  CreateQuestion,
  GetQuestionById,
  UpdateQuestionById,
  GetQuestionListByUser,
};
