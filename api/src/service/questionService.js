const { Op, Sequelize } = require("sequelize");
const { Question, QuestionAnswer } = require("../Repository/models.js");

async function create(profileId, title = null, question = null, option = null) {
  try {
    return await Question.create({
      profileId: profileId,
      title: title,
      question: question,
      option: option,
    });
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
      answer: answer,
      option: option,
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

module.exports = {
  create,
  getById,
  getListByUser,
  addAnswerByQuestionId,
  getAnswerById,
  getAnswerListByQuestionId,
};
