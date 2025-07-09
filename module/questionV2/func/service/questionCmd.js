const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../db/index");
const { Question, QuestionShare, QuestionAnswer, FollowUpFilter, Cmd, Event } = require("../db/model");
const { AGGREGATE_TYPE, ACTION_TYPE, STATUS } = require("../enum");
// const { withTransaction } = require("@zenmechat/shared/service/dbUtils");
const { v4: uuidv4 } = require("uuid");
const { applyPatch } = require("fast-json-patch");

async function createQuestion({ profileId, title = null, questionText, option = null, transaction = null }) {
  const options = transaction ? { transaction } : {};
  return await Question.create(
    {
      profileId: profileId,
      title,
      questionText,
      option,
    },
    options
  );
}
async function updateEventIdOfQuestion({ questionId, eventId, transaction = null }) {
  const options = transaction ? { transaction, lock: transaction.LOCK.UPDATE } : {};
  const question = await Question.findByPk(questionId, options);
  if (!question) throw new Error(`Question ${questionId} not found`);
  return question.update({ eventId }, options);
}

async function patchQuestionById({ questionId, patchData, transaction = null }) {
  const options = {};
  if (transaction) {
    options.transaction = transaction;
    options.lock = transaction.LOCK.UPDATE;
  }
  const question = await Question.findByPk(questionId, options);
  if (!question) {
    throw new Error(`Question ${questionId} not found`);
  }
  const originalData = question.toJSON();
  const updatedData = applyPatch(originalData, patchData).newDocument;
  return await question.update(updatedData, {
    fields: ["title", "questionText", "option"],
    ...options,
  });
}

async function createAnswerByQuestionId({ questionId, profileId, ansData, transaction = null }) {
  const question = await Question.findOne({ where: { id: questionId } });
  if (!question) {
    throw new Error(`Question with ID ${questionId} not found`);
  }
  const options = transaction ? { transaction } : {};
  const { answer: answerText = null, option = null, duration } = ansData;
  return await QuestionAnswer.create(
    {
      questionId,
      profileId,
      answerText,
      optionId: option,
      duration,
    },
    options
  );
}

async function createFollowUpFilter({ senderId, newQuestionId, filterData, transaction = null }) {
  const options = transaction ? { transaction } : {};
  const filterId = uuidv4();
  const filterDataAry = filterData.map(function (filter, i) {
    return {
      id: filterId,
      order: i + 1,
      senderProfileId: senderId,
      refQuestionId: filter.questionId,
      refOption: filter.option,
      newQuestionId: newQuestionId,
    };
  });
  return await FollowUpFilter.bulkCreate(filterDataAry, options);
}

async function createQuestionShare({ questionId, senderId, receiverIds, transaction = null }) {
  const options = transaction ? { transaction } : {};
  const addData = receiverIds.map(function (receiverId) {
    return {
      newQuestionId: questionId,
      senderProfileId: senderId,
      receiverProfileId: receiverId,
    };
  });
  return await QuestionShare.bulkCreate(addData, options);
}

async function createCmd({ aggregateType, action = ACTION_TYPE.CREATE, cmdId, senderId, cmdData, correlationId, transaction = null }) {
  const options = transaction ? { transaction } : {};
  return Cmd.create(
    {
      id: cmdId,
      aggregateType: aggregateType,
      correlationId: correlationId,
      senderProfileId: senderId,
      action,
      data: cmdData,
    },
    options
  );
}

async function createEvent({
  aggregateType,
  aggregateId,
  eventType = ACTION_TYPE.CREATE,
  causationId,
  senderId,
  eventData,
  originalData = null,
  correlationId = null,
  transaction = null,
}) {
  const options = transaction ? { transaction } : {};
  return await Event.create(
    {
      aggregateId,
      aggregateType,
      causationId,
      correlationId,
      senderProfileId: senderId,
      eventType,
      eventData,
      originalData,
    },
    options
  );
}

async function updateCmd({ cmdId, status, eventId = null, transaction = null }) {
  const options = {};
  if (transaction) {
    options.transaction = transaction;
    options.lock = transaction.LOCK.UPDATE;
  }

  const cmd = await Cmd.findByPk(cmdId, options);
  if (!cmd) {
    throw new Error(`Cmd with ID ${cmdId} not found`);
  }
  return cmd.update(
    {
      status,
      eventId,
      // aggregateId, // Not needed here
    },
    options
  );
}

module.exports = {
  createQuestion,
  updateEventIdOfQuestion,
  patchQuestionById,
  createAnswerByQuestionId,
  createFollowUpFilter,
  createQuestionShare,
  createCmd,
  createEvent,
  updateCmd,
};

// async function createQuestion2(cmdId, profileId, cmdData, correlationId = null) {
//   return withTransaction(sequelize, async ({ transaction }) => {
//     const questionData = {
//       profileId: profileId,
//       title: cmdData.title || null,
//       questionText: cmdData.questionText,
//       option: cmdData.option || null,
//     };

//     const cmdPromise = Cmd.create(
//       {
//         id: cmdId,
//         aggregateType: AGGREGATE_TYPE.QUESTION,
//         correlationId: correlationId,
//         senderProfileId: profileId,
//         action: ACTION_TYPE.CREATE,
//         data: cmdData,
//       },
//       { transaction }
//     );

//     const questionPromise = Question.create(questionData, { transaction });
//     const results = await Promise.allSettled([cmdPromise, questionPromise]);
//     const errors = results.filter((r) => r.status === "rejected");
//     if (errors.length > 0) {
//       throw new Error(`Some failed: ${errors.map((e) => e.reason.message).join(", ")}`);
//     }
//     const [cmd, question] = results.map((r) => r.value);
//     const event = await Event.create(
//       {
//         aggregateId: question.id,
//         aggregateType: AGGREGATE_TYPE.QUESTION,
//         causationId: cmd.id,
//         correlationId: correlationId,
//         senderProfileId: profileId,
//         eventType: ACTION_TYPE.CREATE,
//         // TODO: confirm - should this be questionData or question.toJSON()?
//         eventData: questionData,
//       },
//       { transaction }
//     );
//     await cmd.update(
//       {
//         status: STATUS.SUCCESS,
//         eventId: event.id,
//         // aggregateId: question.id,
//       },
//       { transaction }
//     );
//     // TODO:?? is this needed?
//     await question.update({ eventId: event.id }, { transaction });
//     return question;
//   });
// }

// async function patchQuestionById2(questionId, cmdId, profileId, patchData, correlationId = null) {
//   return withTransaction(sequelize, async ({ transaction }) => {
//     const question = await Question.findOne({
//       where: { id: questionId },
//       transaction,
//       lock: transaction.LOCK.UPDATE,
//     });
//     const originalData = question.toJSON();
//     const updatedData = applyPatch(originalData, patchData).newDocument;
//     const cmd = await Cmd.create(
//       {
//         id: cmdId,
//         aggregateType: AGGREGATE_TYPE.QUESTION,
//         correlationId: correlationId,
//         senderProfileId: profileId,
//         action: ACTION_TYPE.UPDATE,
//         data: patchData,
//       },
//       { transaction }
//     );
//     await question.update(updatedData, { fields: ["title", "questionText", "option"], transaction });
//     const event = await Event.create(
//       {
//         aggregateId: question.id,
//         aggregateType: AGGREGATE_TYPE.QUESTION,
//         causationId: cmd.id,
//         correlationId: correlationId,
//         senderProfileId: profileId,
//         eventType: ACTION_TYPE.UPDATE,
//         // TODO: confirm - should this be updatedData or question.toJason()?
//         eventData: updatedData,
//         originalData: originalData,
//       },
//       { transaction }
//     );
//     await cmd.update(
//       {
//         status: STATUS.SUCCESS,
//         eventId: event.id,
//         // aggregateId: question.id,
//       },
//       { transaction }
//     );
//     return question;
//   });
// }

// async function createAnswerByQuestionId2(questionId, cmdId, profileId, cmdData, correlationId = null) {
//   const question = await Question.findOne({ where: { id: questionId } });
//   if (!question) {
//     throw new Error(`Question with ID ${questionId} not found`);
//   }

//   return withTransaction(sequelize, async ({ transaction }) => {
//     const { answer: answerText = null, option = null, duration } = cmdData;
//     const answerData = {
//       questionId,
//       profileId,
//       answerText,
//       optionId: option,
//       duration,
//     };

//     const cmd = await Cmd.create(
//       {
//         id: cmdId,
//         aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
//         correlationId: correlationId,
//         senderProfileId: profileId,
//         action: ACTION_TYPE.CREATE,
//         data: cmdData,
//       },
//       { transaction }
//     );

//     const answer = await question.createAnswer(answerData, { transaction });
//     const event = await Event.create(
//       {
//         aggregateId: answer.id,
//         aggregateType: AGGREGATE_TYPE.QUESTION_ANSWER,
//         causationId: cmd.id,
//         correlationId: correlationId,
//         senderProfileId: profileId,
//         eventType: ACTION_TYPE.CREATE,
//         // TODO: confirm - should this be answerData or answer.toJSON()?
//         eventData: answerData.toJSON(),
//       },
//       { transaction }
//     );

//     await cmd.update(
//       {
//         status: STATUS.SUCCESS,
//         eventId: event.id,
//         // aggregateId: question.id, // Not needed here
//       },
//       { transaction }
//     );

//     return answer;
//   });
// }
