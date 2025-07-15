const Question = require("../service/function.js");
const QuestionCmd = require("../service/questionCmd");
const { withTransaction } = require("@zenmechat/shared/service/dbUtils");
const { sequelize } = require("../db/index");
const { AGGREGATE_TYPE, ACTION_TYPE, STATUS } = require("../enum");

async function CreateQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const { title, questionText, option, profileId } = body;
  // const question = await QuestionCmd.insertQuestion(messageId, body["profileId"], body, correlationId);
  const question = await withTransaction(sequelize, async ({ transaction }) => {
    const cmd = await QuestionCmd.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    const question = await QuestionCmd.insertQuestion({
      profileId,
      title,
      questionText,
      option,
      transaction,
    });
    const event = await QuestionCmd.insertEvent({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      aggregateId: question.id,
      causationId: messageId,
      senderId: body.profileId,
      // TODO: confirm - should this be body or question.toJSON()?
      eventData: body,
      correlationId,
      transaction,
    });
    await QuestionCmd.updateCmd({
      cmdId: cmd.id,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });

    // TODO:?? is this needed?
    // await QuestionCmd.updateEventIdOfQuestion(question.id, event.id, transaction);
    return question;
  });
  console.log("🥳CreateQuestion: ", question);
  //TODO: write cmd status event to service bus, status=successful, cmd["id"], metaData=question["id"]
  // catch errors write cmd status event to service bus, status=error, cmd["id"], metaData={error: error.message}
}

async function UpdateQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const { patchData, questionId, profileId } = body;
  //TODO: put in transaction for the question id & cmd id
  // const question = await QuestionCmd.patchQuestionById(questionId, messageId, profileId, patchData, correlationId);
  const question = await withTransaction(sequelize, async ({ transaction }) => {
    const cmd = await QuestionCmd.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION,
      action: ACTION_TYPE.UPDATE,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    const question = await QuestionCmd.patchQuestionById({ questionId, patchData, transaction });
    const event = await QuestionCmd.insertEvent({
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
    await QuestionCmd.updateCmd({
      cmdId: cmd.id,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return question;
  });
  console.log("🥳UpdateQuestion: ", question);
  //TODO: write event for cmd
  // Id, AggregateId(=questionId), AggregateType(=question), EventType(update), EventData(actionData), CausationId=cmdId
  //end transaction
  //TODO: write cmd status event to service bus
}

async function CreateAnswer(message, context) {
  const { messageId, correlationId, body } = message;
  const { questionId, profileId, answer: answerText = null, option = null, duration } = body;
  // const answer = await QuestionCmd.insertAnswerByQuestionId(questionId, messageId, profileId, body, correlationId);
  const answer = await withTransaction(sequelize, async ({ transaction }) => {
    const cmd = await QuestionCmd.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    const answer = await QuestionCmd.insertAnswerByQuestionId({
      questionId,
      profileId,
      ansData: body,
      transaction,
    });
    const event = await QuestionCmd.insertEvent({
      aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
      aggregateId: answer.id,
      causationId: messageId,
      senderId: body.profileId,
      eventData: body,
      correlationId,
      transaction,
    });
    await QuestionCmd.updateCmd({
      cmdId: cmd.id,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return answer;
  });
  console.log("🥳CreateAnswer: ", answer);
}

async function SendFollowUp(message, context) {
  const { messageId, correlationId, body } = message;
  const { newQuestionId, profileId, question: filterData } = body;
  const sharedQuestions = await withTransaction(sequelize, async ({ transaction }) => {
    const cmd = await QuestionCmd.insertCmd({
      aggregateType: AGGREGATE_TYPE.FOLLOW_UP,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    const filters = await QuestionCmd.insertFollowUpFilter({
      senderId: profileId,
      newQuestionId,
      filterData,
      transaction,
    });
    const receiverIds = await Question.getFollowUpReceiver(body);
    const sharedQuestions = await QuestionCmd.insertQuestionShare({
      questionId: newQuestionId,
      senderId: profileId,
      receiverIds,
      transaction,
    });
    const event = await QuestionCmd.insertEvent({
      aggregateType: AGGREGATE_TYPE.FOLLOW_UP,
      aggregateId: null,
      causationId: messageId,
      senderId: profileId,
      eventData: body,
      correlationId,
      transaction,
    });
    await QuestionCmd.updateCmd({
      cmdId: messageId,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return sharedQuestions;
  });
  console.log("🥳SendFollowUp: ", sharedQuestions);
}

async function ShareQuestion(message, context) {
  const { messageId, correlationId, body } = message;
  const { newQuestionId, profileId, receiverIds } = body;
  const sharedQuestions = await withTransaction(sequelize, async ({ transaction }) => {
    const cmd = await QuestionCmd.insertCmd({
      aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
      cmdId: messageId,
      senderId: profileId,
      cmdData: body,
      correlationId,
      transaction,
    });
    const sharedQuestions = await QuestionCmd.insertQuestionShare({
      questionId: newQuestionId,
      senderId: profileId,
      receiverIds,
      transaction,
    });
    // sharedQuestions.map(async (sharedQuestion) => {
    //   await Cmd.insertEvent({
    //     aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
    //     aggregateId: sharedQuestion.id,
    //     causationId: messageId,
    //     senderId: profileId,
    //     eventData: {
    //       newQuestionId,
    //       senderProfileId: profileId,
    //       receiverProfileId: receiverId,
    //     },
    //     correlationId,
    //     transaction,
    //   });
    // });
    const event = await QuestionCmd.insertEvent({
      aggregateType: AGGREGATE_TYPE.QUESTION_SHARE,
      aggregateId: null,
      causationId: messageId,
      senderId: profileId,
      eventData: body,
      correlationId,
      transaction,
    });
    await QuestionCmd.updateCmd({
      cmdId: cmd.id,
      status: STATUS.SUCCESS,
      eventId: event.id,
      transaction,
    });
    return sharedQuestions;
  });
  console.log("🥳ShareQuestion: ", sharedQuestions);
}

module.exports = {
  CreateQuestion,
  UpdateQuestion,
  CreateAnswer,
  SendFollowUp,
  ShareQuestion,
};
