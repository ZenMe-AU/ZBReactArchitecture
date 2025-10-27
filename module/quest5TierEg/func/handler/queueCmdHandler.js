/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const QuestionService = require("../service/questionService");

/**
 * Event Grid calls CreateQuestion to create a new question.
 * It processes the question creation, updates the command status, and returns the created question.
 */
async function CreateQuestion(events, context) {
  const { id, data, source, type, correlationid: correlationId } = events;
  const { title, questionText, option, profileId } = data;
  await QuestionService.createQuestion(id, type, { title, questionText, option, profileId }, correlationId, profileId, title, questionText, option);
}

/**
 * Event Grid calls UpdateQuestion to update an existing question.
 * It processes the question update, applies the patch data, and updates the command status.
 */
async function UpdateQuestion(events, context) {
  const { id, data, source, type, correlationid: correlationId } = events;
  const { patchData, questionId, profileId } = data;
  const question = await QuestionService.updateQuestion(id, type, data, correlationId, profileId, questionId, patchData);
  // console.log("🥳UpdateQuestion: ", question);
}

/**
 * Event Grid calls CreateAnswer to create an answer for a question.
 * It processes the answer creation, updates the command status, and returns the created answer.
 */
async function CreateAnswer(events, context) {
  const { id, data, source, type, correlationid: correlationId } = events;
  const { questionId, profileId, answer: answerText = null, option = null, duration } = data;
  const answer = await QuestionService.createAnswer(id, type, data, correlationId, profileId, questionId);
  // console.log("🥳CreateAnswer: ", answer);
}

/**
 * Event Grid calls SendFollowUp to send the follow-up questions based on the answers given by the users.
 * It processes the follow-up questions, shares them with the appropriate users, and updates the command status.
 */
async function SendFollowUp(events, context) {
  const { id, data, source, type, correlationid: correlationId } = events;
  const { questionIdList, profileId, question: filterData } = data;
  const sharedQuestions = await QuestionService.sendFollowUp(id, type, data, correlationId, profileId, questionIdList);
  // console.log("🥳SendFollowUp: ", sharedQuestions);
}

/**
 * Event Grid calls ShareQuestion to share a question with other users.
 * It processes the sharing of the question and updates the command status.
 */
async function ShareQuestion(events, context) {
  const { id, data, source, type, correlationid: correlationId } = events;
  const { newQuestionId, profileId, receiverIds } = data;
  const sharedQuestions = await QuestionService.shareQuestion(id, type, data, correlationId, profileId, newQuestionId, receiverIds);
  // console.log("🥳ShareQuestion: ", sharedQuestions);
}

module.exports = {
  CreateQuestion,
  UpdateQuestion,
  CreateAnswer,
  SendFollowUp,
  ShareQuestion,
};
