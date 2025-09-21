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
const { sendMessageToQueue } = require("../serviceBus/function");
const { qNameQuestionCreatedEvent } = require("../serviceBus/queueNameList");

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
      profileId,
      title: questionTitle,
      questionText,
      optionList: questionOption,
      transaction,
    });

    // -------- notify that a new question has been created -------- //
    // Send Event to questionCreatedEvent service bus queue
    const eventBody = {
      aggregateType: AGGREGATE_TYPE.QUESTION,
      aggregateId: question.id,
      causationId: cmdId,
      causationType: cmdType,
      senderId,
    };
    // Send the event message to the service bus
    const eventMessageId = await sendMessageToQueue({
      queueName: qNameQuestionCreatedEvent,
      body: eventBody,
      correlationId,
      messageId: cmdId, // use the same messageId as the command for easier tracking, this may change in the future if cmd is not 1:1 with event
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

async function updateQuestion(messageId, profileId, body, correlationId, questionId, patchData) {
  let sequelize = container.get("db");
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // insert a command for the question update
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      action: ACTION_TYPE.UPDATE,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    const question = await QuestionRepo.patchQuestionById({ questionId, patchData, transaction }); // update the question with the provided patch data
    // create an event for the question update
    const event = await EventRepo.insertEvent({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      aggregateId: questionId,
      eventType: ACTION_TYPE.UPDATE,
      causationId: messageId,
      senderId: profileId,
      eventData: patchData,
      originalData: question._previousDataValues,
      correlationId,
      transaction,
    });
    // update the command status to success
    await CmdRepo.updateCmd({
      cmdId: cmd.id,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return question;
  });
}

async function createAnswer(messageId, profileId, body, correlationId, questionId) {
  let sequelize = container.get("db");
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // inserts a command for the answer creation
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
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
      profileId,
      ansData: body,
      transaction,
    });
    // creates an event for the answer creation
    const event = await EventRepo.insertEvent({
      aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
      aggregateId: answer.id,
      causationId: messageId,
      senderId: body.profileId,
      eventData: body,
      correlationId,
      transaction,
    });
    // updates the command status to success
    await CmdRepo.updateCmd({
      cmdId: cmd.id,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return answer;
  });
}

async function sendFollowUp(messageId, profileId, body, correlationId, questionIdList) {
  let sequelize = container.get("db");
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // inserts a command for the follow-up action
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.FOLLOW_UP,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    const receiverIds = await QuestionQueryService.getFollowUpReceiver(body); // filters the receiver IDs based on the answers to the questions
    // shares the question with the specified receiver IDs
    const sharedQuestions = questionIdList.map(async (questionId) => {
      return await ShareRepo.insertQuestionShare({
        questionId,
        senderId: profileId,
        receiverIds,
        transaction,
      });
    });
    // creates an event for the follow-up action
    const event = await EventRepo.insertEvent({
      aggregateType: AGGREGATE_TYPE.FOLLOW_UP,
      aggregateId: null,
      causationId: messageId,
      senderId: profileId,
      eventData: body,
      correlationId,
      transaction,
    });
    // updates the command status to success
    await CmdRepo.updateCmd({
      cmdId: messageId,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return sharedQuestions;
  });
}

async function shareQuestion(messageId, profileId, body, correlationId, newQuestionId, receiverIds) {
  let sequelize = container.get("db");
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // inserts a command for the question sharing action
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    // shares the question with the specified receiver IDs
    const sharedQuestions = await ShareRepo.insertQuestionShare({
      questionId: newQuestionId,
      senderId: profileId,
      receiverIds,
      transaction,
    });
    // creates an event for the question sharing action
    const event = await EventRepo.insertEvent({
      aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
      aggregateId: null,
      causationId: messageId,
      senderId: profileId,
      eventData: body,
      correlationId,
      transaction,
    });
    // updates the command status to success
    await CmdRepo.updateCmd({
      cmdId: cmd.id,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return sharedQuestions;
  });
}

module.exports = {
  createQuestion,
  updateQuestion,
  createAnswer,
  sendFollowUp,
  shareQuestion,
};
