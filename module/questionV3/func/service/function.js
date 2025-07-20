const { Op } = require("sequelize");
const { Question, QuestionAnswer, QuestionShare, Event } = require("../db/model");
const { AGGREGATE_TYPE } = require("../enum.js");

async function getById(questionId) {
  try {
    // return await Questionnaires.findOne({ where: { id: questionId } });
    return await Question.findByPk(questionId);
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getCombinationListByUser(profileId) {
  try {
    return await Question.findAll({
      where: {
        [Op.or]: [
          { profileId: profileId },
          {
            "$questionShares.receiverProfileId$": profileId,
          },
        ],
      },
      include: [
        {
          model: QuestionShare,
          attributes: [],
          group: ["newQuestionId"],
        },
      ],
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getAnswerById(answerId) {
  try {
    return await QuestionAnswer.findOne({
      where: {
        id: answerId,
        // questionId: questionId
      },
    });
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getAnswerListByQuestionId(questionId) {
  try {
    // return await QuestionAnswer.findAll({ where: { questionId: questionId }, order: [["createdAt", "DESC"]] });
    // return await QuestionAnswer.findAll({
    //   attributes: [
    //     "profileId",
    //     [Sequelize.fn("MAX", Sequelize.col("createdAt")), "latestCreatedAt"],
    //     [Sequelize.fn("COUNT", Sequelize.col("id")), "answerCount"],
    //     [Sequelize.literal(`FIRST_VALUE("answerText") OVER (PARTITION BY "profileId" ORDER BY "createdAt" DESC)`), "answerText"],
    //     [Sequelize.literal(`FIRST_VALUE("optionId") OVER (PARTITION BY "profileId" ORDER BY "createdAt" DESC)`), "optionId"],
    //    ],
    //   where: { questionId },
    //   group: ["profileId"],
    //   order: [[Sequelize.fn("MAX", Sequelize.col("createdAt")), "DESC"]],
    //   raw: true,
    // });
    return await await QuestionAnswer.sequelize.query(
      `
          SELECT DISTINCT ON ("profileId")
            "id",
            "profileId",
            "createdAt",
            COUNT("id") OVER (PARTITION BY "profileId") AS "answerCount",
            "questionId",
            "answerText",
            "optionAnswerList",
            "duration",
            "when"
          FROM "questionAnswer"
          WHERE "questionId" = :questionId
          ORDER BY "profileId", "createdAt" DESC;
        `,
      {
        replacements: { questionId },
        type: QuestionAnswer.sequelize.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getFollowUpReceiver(cmdData) {
  try {
    const { question: questionFilter } = cmdData;
    const receiverIdSet = new Set();

    await Promise.all(
      questionFilter.map(async ({ questionId, option }) => {
        const ansList = await getAnswerListByQuestionId(questionId);
        const filterOptionSet = new Set(option);

        for (const { profileId, optionAnswerList } of ansList) {
          const isSelf = profileId === cmdData.profileId;
          const hasMatchedOption = (optionAnswerList ?? []).some((opt) => filterOptionSet.has(opt));

          if (!isSelf && hasMatchedOption) {
            receiverIdSet.add(profileId);
          }
        }
      })
    );

    return [...receiverIdSet];
  } catch (err) {
    console.log(err);
    throw new Error(`Function failed: ${err.message}`, { cause: err });
  }
}

async function getSharedQuestionListByUser(profileId) {
  try {
    return await QuestionShare.findAll({
      where: { receiverId: profileId },
      include: [
        {
          model: Question,
          attributes: ["title", "questionText", "option"],
        },
      ],
    });
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
    return await Event.findAll({
      where: {
        correlationId,
        aggregateType,
      },
    });
  } catch (err) {
    console.log(err);
    throw new Error("can't get event by correlationId");
  }
}

module.exports = {
  getById,
  getAnswerById,
  getCombinationListByUser,
  getAnswerListByQuestionId,
  getSharedQuestionListByUser,
  getEventByCorrelationId,
  getFollowUpReceiver,
  // create,
  // updateById,
  // getById,
  // getListByUser,
  // getCombinationListByUser,
  // addAnswerByQuestionId,
  // getAnswerById,
  // getAnswerListByQuestionId,
  // shareQuestion,
  // addFollowUpByQuestionId,
  // getSharedQuestionListByUser,
  // patchById,
  // insertFollowUpCmd,
  // insertFollowUpFilter,
  // getFollowUpReceiver,
  // updateFollowUpCmdStatus,
  // insertQuestionShareCmd,
  // updateQuestionShareCmdStatus,
  // getEventByCorrelationId,
  // insertQuestionCmd,
  // updateQuestionCmdStatus,
  // insertQuestionAnswerCmd,
  // updateQuestionAnswerCmdStatus,
};
