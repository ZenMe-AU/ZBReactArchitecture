const { Question } = require("../db/model");
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

async function patchQuestionById({ questionId, patchData, fields = ["title", "questionText", "optionList"], transaction = null }) {
  const options = {};
  if (transaction) {
    options.transaction = transaction;
    options.lock = transaction.LOCK.UPDATE;
  }
  const question = await Question.findByPk(questionId, options);
  const originalData = question.toJSON();
  const updatedData = applyPatch(originalData, patchData).newDocument;
  return await question.update(updatedData, {
    fields,
    ...options,
  });
}

module.exports = {
  insertQuestion,
  patchQuestionById,
};
