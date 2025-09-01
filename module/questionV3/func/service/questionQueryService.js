const QuestionRepo = require("../repository/questionRepository");
const AnswerRepo = require("../repository/questionAnswerRepository");
const ShareRepo = require("../repository/questionShareRepository");
const EventRepo = require("../repository/eventRepository");
const { AGGREGATE_TYPE } = require("../enum.js");

async function getById(questionId) {
  try {
    return await QuestionRepo.getQuestionById(questionId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getCombinationListByUser(profileId) {
  try {
    return await QuestionRepo.getQuestionAndShareListByProfileId(profileId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getAnswerById(answerId) {
  try {
    return await AnswerRepo.getAnswerById(answerId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getAnswerListByQuestionId(questionId) {
  try {
    return await AnswerRepo.getAnswerListByQuestionId(questionId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getFollowUpReceiver(cmdData) {
  try {
    const { question: questionFilter, profileId: senderProfileId } = cmdData;
    const profileIdSets = await Promise.all(
      questionFilter.map(async ({ questionId, option }) => {
        const ansList = await AnswerRepo.getAnswerListByQuestionId(questionId);
        const filterOptionSet = new Set(option);
        const matchedProfileIdSet = new Set();

        for (const { profileId, optionAnswerList } of ansList) {
          if (profileId === senderProfileId) continue;

          const hasMatchedOption = (optionAnswerList ?? []).some((opt) => filterOptionSet.has(opt));

          if (hasMatchedOption) {
            matchedProfileIdSet.add(profileId);
          }
        }

        return matchedProfileIdSet;
      })
    );

    let intersectionSet = null;

    for (const profileIdSet of profileIdSets) {
      if (intersectionSet === null) {
        intersectionSet = profileIdSet;
      } else {
        intersectionSet = new Set([...intersectionSet].filter((id) => profileIdSet.has(id)));
      }

      if (intersectionSet.size === 0) break;
    }

    return [...(intersectionSet ?? [])];
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getSharedQuestionListByUser(profileId) {
  try {
    return await ShareRepo.getShareListByProfileId(profileId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getEventByCorrelationId(name, correlationId) {
  let aggregateType;
  switch (name) {
    case AGGREGATE_TYPE.QUESTION:
      aggregateType = AGGREGATE_TYPE.QUESTION;
      break;
    case AGGREGATE_TYPE.QUESTION_SHARE:
      aggregateType = AGGREGATE_TYPE.QUESTION;
      break;
    case AGGREGATE_TYPE.QUESTION_ANSWER:
      aggregateType = AGGREGATE_TYPE.QUESTION_ANSWER;
      break;
    case AGGREGATE_TYPE.FOLLOW_UP:
      aggregateType = AGGREGATE_TYPE.FOLLOW_UP;
      break;
    default:
      throw new Error("unknown eventName");
  }
  try {
    return await EventRepo.searchEvent(aggregateType, correlationId);
  } catch (err) {
    console.log(err);
    throw new Error("can't get event by correlationId");
  }
}

module.exports = {
  getById,
  getCombinationListByUser,
  getAnswerById,
  getAnswerListByQuestionId,
  getFollowUpReceiver,
  getSharedQuestionListByUser,
  getEventByCorrelationId,
};
