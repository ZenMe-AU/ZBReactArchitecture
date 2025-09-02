const BaseRepository = require("@zenmechat/shared/repository/baseRepository");

class QuestionShareRepository extends BaseRepository {
  constructor() {
    super(["QuestionShare", "Question"]);
  }

  async insertQuestionShare({ questionId, senderId, receiverIds, transaction = null }) {
    const options = transaction ? { transaction } : {};
    const addData = receiverIds.map(function (receiverId) {
      return {
        questionId,
        senderProfileId: senderId,
        receiverProfileId: receiverId,
      };
    });
    return await this.QuestionShare.bulkCreate(addData, options);
  }

  async getShareListByProfileId(profileId) {
    return await this.QuestionShare.findAll({
      where: { receiverProfileId: profileId },
      include: [
        {
          model: this.Question,
          attributes: ["title", "questionText", "option"],
        },
      ],
    });
  }
}

module.exports = new QuestionShareRepository();
