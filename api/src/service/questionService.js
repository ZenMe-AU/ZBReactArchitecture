const { Op, Sequelize } = require("sequelize");
const { Question, QuestionAnswer, QuestionShare, QuestionAction } = require("../Repository/models.js");

async function create(profileId, title = null, question = null, option = null) {
  try {
    return await Question.create({
      profileId: profileId,
      title: title,
      questionText: question,
      option: option,
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function updateById(questionId, title = null, questionText = null, option = null) {
  try {
    return await Question.update(
      {
        title: title,
        questionText: questionText,
        option: option,
      },
      {
        where: {
          id: questionId,
        },
        individualHooks: true,
      }
    );
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getById(questionId) {
  try {
    // return await Questionnaires.findOne({ where: { id: questionId } });
    return await Question.findByPk(questionId);
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getListByUser(profileId) {
  try {
    return await Question.findAll({ where: { profileId: profileId } });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getCombinationListByUser(profileId) {
  try {
    return await Question.findAll({
      where: {
        [Op.or]: [
          { profileId: profileId },
          {
            "$question_shares.receiverId$": profileId,
          },
        ],
      },
      include: [
        {
          model: QuestionShare,
          attributes: [],
          group: ["questionId"],
        },
      ],
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function addAnswerByQuestionId(questionId, profileId, duration, answer = null, option = null) {
  try {
    return await QuestionAnswer.create({
      questionId: questionId,
      profileId: profileId,
      answerText: answer,
      optionId: option,
      duration: duration,
    });
  } catch (err) {
    console.log(err);
    return;
  }
}

async function getAnswerById(questionId, answerId) {
  try {
    return await QuestionAnswer.findOne({ where: { id: answerId, questionId: questionId } });
  } catch (err) {
    console.log(err);
    return;
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
            "optionId",
            "duration"
          FROM "question_answer"
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
    return;
  }
}

async function addShareByQuestionId(questionId, senderId, receiverIds) {
  try {
    const addData = receiverIds.map(function (receiverId) {
      return {
        questionId: questionId,
        senderId: senderId,
        receiverId: receiverId,
      };
    });
    return await QuestionShare.bulkCreate(addData);
  } catch (err) {
    console.log(err);
    return;
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
    return;
  }
}

async function patchById(questionId, action, profileId) {
  try {
    return await QuestionAction.create({ questionId, profileId, action });
  } catch (err) {
    console.log(err);
    return;
  }
}

module.exports = {
  create,
  updateById,
  getById,
  getListByUser,
  getCombinationListByUser,
  addAnswerByQuestionId,
  getAnswerById,
  getAnswerListByQuestionId,
  addShareByQuestionId,
  getSharedQuestionListByUser,
  patchById,
};
