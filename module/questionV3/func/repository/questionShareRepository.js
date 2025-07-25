const { QuestionShare } = require("../db/model");

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

module.exports = {
  insertQuestionShare,
};
