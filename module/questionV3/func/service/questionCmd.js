const { Question, QuestionShare, QuestionAnswer, FollowUpFilter, Cmd, Event } = require("../db/model");
const { AGGREGATE_TYPE, ACTION_TYPE, STATUS } = require("../enum");
const { v4: uuidv4 } = require("uuid");
const { applyPatch } = require("fast-json-patch");

async function insertQuestion({ profileId, title = null, questionText, optionList = null, transaction = null }) {
  const options = transaction ? { transaction } : {};
  return await Question.create(
    {
      profileId: profileId,
      title,
      questionText,
      optionList,
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
    fields: ["title", "questionText", "optionList"],
    ...options,
  });
}

async function insertAnswerByQuestionId({ questionId, profileId, ansData, transaction = null }) {
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
      optionAnswerList: option,
      duration,
    },
    options
  );
}

async function upsertAnswerByQuestionId({ questionId, profileId, ansData, transaction = null }) {
  const question = await Question.findOne({ where: { id: questionId } });
  if (!question) {
    throw new Error(`Question with ID ${questionId} not found`);
  }
  const options = {};
  if (transaction) {
    options.transaction = transaction;
    options.lock = transaction.LOCK.UPDATE;
  }
  const { answer: answerText = null, option: optionAnswerList = null, duration, when = null } = ansData;
  return await QuestionAnswer.upsert(
    {
      questionId,
      profileId,
      answerText,
      optionAnswerList,
      duration,
      when,
    },
    options
  );
}

async function insertFollowUpFilter({ senderId, questionIdList, filterData, transaction = null }) {
  const options = transaction ? { transaction } : {};
  const filterId = uuidv4();
  const filterDataAry = filterData.map(function (filter, i) {
    return {
      id: filterId,
      order: i + 1,
      senderProfileId: senderId,
      refQuestionId: filter.questionId,
      refOption: filter.option,
      questionIdList,
    };
  });
  return await FollowUpFilter.bulkCreate(filterDataAry, options);
}

async function insertQuestionShare({ questionId, senderId, receiverIds, transaction = null }) {
  const options = transaction ? { transaction } : {};
  const addData = receiverIds.map(function (receiverId) {
    return {
      questionId,
      senderProfileId: senderId,
      receiverProfileId: receiverId,
    };
  });
  return await QuestionShare.bulkCreate(addData, options);
}

async function insertCmd({ aggregateType, action = ACTION_TYPE.CREATE, cmdId, senderId, cmdData, correlationId, transaction = null }) {
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

async function insertEvent({
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
  insertQuestion,
  updateEventIdOfQuestion,
  patchQuestionById,
  upsertAnswerByQuestionId,
  insertFollowUpFilter,
  insertQuestionShare,
  insertCmd,
  insertEvent,
  updateCmd,
};
