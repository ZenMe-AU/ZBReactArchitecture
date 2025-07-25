const { QuestionAnswer } = require("../db/model");

async function upsertAnswerByQuestionId({ questionId, profileId, ansData, transaction = null }) {
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
module.exports = {
  upsertAnswerByQuestionId,
};
