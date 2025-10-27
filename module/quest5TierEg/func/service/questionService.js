/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { withTransaction } = require("./dbUtils");
const CmdRepo = require("../repository/cmdRepository");
const QuestionRepo = require("../repository/questionRepository");
const EventRepo = require("../repository/eventRepository");
const AnswerRepo = require("../repository/questionAnswerRepository");
const ShareRepo = require("../repository/questionShareRepository");
const AGGREGATE_TYPE = require("../enum/aggregateType");
const ACTION_TYPE = require("../enum/actionType");
const STATUS = require("../enum/status");
const container = require("../di/diContainer");
const QuestionQueryService = require("./questionQueryService");
const {
  sendFollowUpSentEvent,
  sendQuestionSharedEvent,
  sendQuestionCreatedEvent,
  sendQuestionUpdatedEvent,
  sendAnswerCreatedEvent,
} = require("../eventGrid/eventSender");
const { join, resolve, relative, basename } = require("path");
const fs = require("fs");

async function createQuestion(cmdId, cmdType, cmdBody, correlationId, senderId, questionTitle, questionText, questionOption) {
  let sequelize = container.get("db");
  // run whole command in a transaction to ensure the event is written only if the question is created successfully
  return await withTransaction(sequelize, async ({ transaction }) => {
    // inserts a command for the question creation
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      cmdId,
      senderId,
      cmdData: cmdBody,
      correlationId,
      transaction,
    });
    // creates a new question with the provided data
    const question = await QuestionRepo.insertQuestion({
      profileId: senderId,
      title: questionTitle,
      questionText,
      optionList: questionOption,
      transaction,
    });

    // -------- notify that a new question has been created -------- //
    // Send Event to questionCreatedEvent event grid topic
    const eventBody = {
      aggregateType: AGGREGATE_TYPE.QUESTION,
      aggregateId: question.id,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
    };
    // Send the event message to the event grid
    const eventMessageId = await sendQuestionCreatedEvent({
      messageId: cmdId, // use the same messageId as the command for easier tracking, this may change in the future if cmd is not 1:1 with event
      source: getFilePath() + "::" + createQuestion.name,
      body: eventBody,
      correlationId,
    });
    // creates an event for the question creation, this is slower than sending to the queue but easier to keep the code in one place
    const event = await EventRepo.insertEvent({
      id: eventMessageId,
      aggregateType: AGGREGATE_TYPE.QUESTION,
      aggregateId: question.id,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
      eventData: eventBody,
      correlationId,
      transaction,
    });
    // updates the command status to success
    await CmdRepo.updateCmd({
      cmdId,
      status: STATUS.SUCCESS,
      eventId: eventMessageId,
      transaction,
    });
    // ------------------------------------------------------------ //
  });
}

// async function updateQuestion(messageId, profileId, body, correlationId, questionId, patchData) {
async function updateQuestion(cmdId, cmdType, cmdBody, correlationId, senderId, questionId, patchData) {
  let sequelize = container.get("db");
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // insert a command for the question update
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      action: ACTION_TYPE.UPDATE,
      cmdId,
      senderId,
      cmdData: cmdBody,
      correlationId,
      transaction,
    });
    const question = await QuestionRepo.patchQuestionById({ questionId, patchData, transaction }); // update the question with the provided patch data
    // -------- notify that a new question has been updated -------- //
    // Send Event to questionUpdatedEvent event grid topic
    const eventBody = {
      aggregateType: AGGREGATE_TYPE.QUESTION,
      aggregateId: questionId,
      eventType: ACTION_TYPE.UPDATE,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
    };
    // Send the event message to the s event grid
    const eventMessageId = await sendQuestionUpdatedEvent({
      messageId: cmdId, // use the same messageId as the command for easier tracking, this may change in the future if cmd is not 1:1 with event
      source: getFilePath() + "::" + updateQuestion.name,
      body: eventBody,
      correlationId,
    });
    // create an event for the question update
    const event = await EventRepo.insertEvent({
      id: eventMessageId,
      aggregateType: AGGREGATE_TYPE.QUESTION,
      aggregateId: questionId,
      eventType: ACTION_TYPE.UPDATE,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
      eventData: patchData,
      originalData: question._previousDataValues,
      correlationId,
      transaction,
    });
    // update the command status to success
    await CmdRepo.updateCmd({
      cmdId,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return question;
  });
}

// async function createAnswer(messageId, profileId, body, correlationId, questionId) {
async function createAnswer(cmdId, cmdType, cmdBody, correlationId, senderId, questionId) {
  let sequelize = container.get("db");
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // inserts a command for the answer creation
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
      cmdId,
      senderId,
      cmdData: cmdBody,
      correlationId,
      transaction,
    });

    // const question = await Question.findOne({ where: { id: questionId } });
    // if (!question) {
    //   throw new Error(`Question with ID ${questionId} not found`);
    // }
    // If the answer already exists, it will be updated, otherwise a new one will be created
    const answer = await AnswerRepo.upsertAnswerByQuestionId({
      questionId,
      profileId: senderId,
      ansData: cmdBody,
      transaction,
    });
    // -------- notify that a new question has been updated -------- //
    // Send Event to answerCreatedEvent event grid topic
    const eventBody = {
      aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
      aggregateId: answer.id,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
    };
    // Send the event message to the event grid
    const eventMessageId = await sendAnswerCreatedEvent({
      messageId: cmdId, // use the same messageId as the command for easier tracking, this may change in the future if cmd is not 1:1 with event
      source: getFilePath() + "::" + createAnswer.name,
      body: eventBody,
      correlationId,
    });
    // creates an event for the answer creation
    const event = await EventRepo.insertEvent({
      id: eventMessageId,
      aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
      aggregateId: answer.id,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
      eventData: cmdBody,
      correlationId,
      transaction,
    });
    // updates the command status to success
    await CmdRepo.updateCmd({
      cmdId,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return answer;
  });
}

// async function sendFollowUp(messageId, profileId, body, correlationId, questionIdList) {
async function sendFollowUp(cmdId, cmdType, cmdBody, correlationId, senderId, questionIdList) {
  let sequelize = container.get("db");
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // inserts a command for the follow-up action
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.FOLLOW_UP,
      cmdId,
      senderId,
      cmdData: cmdBody,
      correlationId,
      transaction,
    });
    const receiverIds = await QuestionQueryService.getFollowUpReceiver(cmdBody); // filters the receiver IDs based on the answers to the questions
    // shares the question with the specified receiver IDs
    const sharedQuestions = questionIdList.map(async (questionId) => {
      const result = await ShareRepo.insertQuestionShare({
        questionId,
        senderId,
        receiverIds,
        transaction,
      });
      result.map(async (r) => {
        // -------- notify that a new question has been updated -------- //
        // Send Event to questionSharedEvent event grid topic
        const eventBody = {
          aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
          aggregateId: r.id,
          causationId: cmdId,
          causationType: cmdType,
          senderId,
          receiverId: r.receiverProfileId,
          questionId: r.questionId,
        };
        // Send the event message to the event grid
        const eventMessageId = await sendQuestionSharedEvent({
          source: getFilePath() + "::" + sendFollowUp.name,
          body: eventBody,
          correlationId,
        });
        // creates an event for the question sharing action
        const event = await EventRepo.insertEvent({
          id: eventMessageId,
          aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
          aggregateId: r.id,
          causationId: cmdId,
          causationType: cmdType,
          senderId,
          eventData: eventBody,
          correlationId,
          transaction,
        });
      });
      return result;
    });
    // Send Event to followUpSentEvent event grid topic
    const eventBody = {
      aggregateType: AGGREGATE_TYPE.FOLLOW_UP,
      aggregateId: null,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
    };

    // Send the event message to the event grid
    const eventMessageId = await sendFollowUpSentEvent({
      messageId: cmdId, // use the same messageId as the command for easier tracking, this may change in the future if cmd is not 1:1 with event
      source: getFilePath() + "::" + sendFollowUp.name,
      body: eventBody,
      correlationId,
    });
    // creates an event for the follow-up action
    const event = await EventRepo.insertEvent({
      id: eventMessageId,
      aggregateType: AGGREGATE_TYPE.FOLLOW_UP,
      aggregateId: null,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
      eventData: cmdBody,
      correlationId,
      transaction,
    });
    // updates the command status to success
    await CmdRepo.updateCmd({
      cmdId,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return sharedQuestions;
  });
}

// async function shareQuestion(messageId, profileId, body, correlationId, newQuestionId, receiverIds) {
async function shareQuestion(cmdId, cmdType, cmdBody, correlationId, senderId, newQuestionId, receiverIds) {
  let sequelize = container.get("db");
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // inserts a command for the question sharing action
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
      cmdId,
      senderId,
      cmdData: cmdBody,
      correlationId,
      transaction,
    });
    // shares the question with the specified receiver IDs
    const sharedQuestions = await ShareRepo.insertQuestionShare({
      questionId: newQuestionId,
      senderId,
      receiverIds,
      transaction,
    });

    sharedQuestions.map(async (questionShare) => {
      // -------- notify that a new question has been updated -------- //
      // Send Event to questionSharedEvent event grid topic
      const eventBody = {
        aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
        aggregateId: questionShare.id,
        causationId: cmdId,
        causationType: cmdType,
        senderId,
        receiverId: questionShare.receiverProfileId,
        questionId: questionShare.questionId,
      };
      // Send the event message to the event grid
      const eventMessageId = await sendQuestionSharedEvent({
        source: getFilePath() + "::" + shareQuestion.name,
        body: eventBody,
        correlationId,
      });
      // creates an event for the question sharing action
      const event = await EventRepo.insertEvent({
        id: eventMessageId,
        aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
        aggregateId: questionShare.id,
        causationId: cmdId,
        causationType: cmdType,
        senderId,
        eventData: eventBody,
        correlationId,
        transaction,
      });
    });
    // -------- notify that a new question has been updated -------- //
    // Send Event to questionSharedEvent event grid topic
    const eventBody = {
      aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
      aggregateId: null,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
    };
    // Send the event message to the event grid
    const eventMessageId = await sendQuestionSharedEvent({
      messageId: cmdId, // use the same messageId as the command for easier tracking, this may change in the future if cmd is not 1:1 with event
      source: getFilePath() + "::" + shareQuestion.name,
      body: eventBody,
      correlationId,
    });
    // creates an event for the question sharing action
    const event = await EventRepo.insertEvent({
      id: eventMessageId,
      aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
      aggregateId: null,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
      eventData: cmdBody,
      correlationId,
      transaction,
    });
    // updates the command status to success
    await CmdRepo.updateCmd({
      cmdId,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return sharedQuestions;
  });
}

let cachedFilePath = null;
function getFilePath() {
  if (cachedFilePath) return cachedFilePath;
  let currentDir = __dirname;
  const found = [];
  while (found.length < 2) {
    const pkgPath = resolve(currentDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      found.push(currentDir);
    }
    const parent = resolve(currentDir, "..");
    if (parent === currentDir) {
      found.push(currentDir);
    }
    currentDir = parent;
  }
  return (cachedFilePath = join(basename(found[1]), relative(found[1], __filename)));
}
module.exports = {
  createQuestion,
  updateQuestion,
  createAnswer,
  sendFollowUp,
  shareQuestion,
};
