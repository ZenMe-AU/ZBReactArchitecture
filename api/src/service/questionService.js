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

async function addAnswerByQuestionId(questionId, profileId, answer = null, option = null) {
  try {
    return await QuestionAnswer.create({
      questionId: questionId,
      profileId: profileId,
      answerText: answer,
      optionId: option,
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
    return await QuestionAnswer.findAll({ where: { questionId: questionId } });
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
  addAnswerByQuestionId,
  getAnswerById,
  getAnswerListByQuestionId,
  addShareByQuestionId,
  getSharedQuestionListByUser,
  patchById,
};
