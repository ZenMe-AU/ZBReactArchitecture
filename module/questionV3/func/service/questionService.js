const { withTransaction } = require("@zenmechat/shared/service/dbUtils");
const CmdRepo = require("../repository/cmdRepository");
const QuestionRepo = require("../repository/questionRepository");
const EventRepo = require("../repository/eventRepository");
const AnswerRepo = require("../repository/questionAnswerRepository");
const ShareRepo = require("../repository/questionShareRepository");
const { AGGREGATE_TYPE, ACTION_TYPE, STATUS } = require("../enum");
const { sequelize } = require("../db/index");
const { getFollowUpReceiver } = require("./function");

async function createQuestion(messageId, profileId, body, correlationId, title, questionText, option) {
  // run whole command in a transaction
  return await withTransaction(sequelize, async ({ transaction }) => {
    // inserts a command for the question creation
    const cmd = await CmdRepo.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    // creates a new question with the provided data
    const question = await QuestionRepo.insertQuestion({
      profileId,
      title,
      questionText,
      optionList: option,
      transaction,
    });
    // creates an event for the question creation
    const event = await EventRepo.insertEvent({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      aggregateId: question.id,
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
  });
}

async function updateQuestion(messageId, profileId, body, correlationId, questionId, patchData) {
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
    const receiverIds = await getFollowUpReceiver(body); // filters the receiver IDs based on the answers to the questions
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
