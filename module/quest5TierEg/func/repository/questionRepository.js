const BaseRepository = require("./baseRepository");
const { applyPatch } = require("fast-json-patch");
const { Op } = require("sequelize");

class QuestionRepository extends BaseRepository {
  constructor() {
    super(["Question", "QuestionShare"]);
  }

  async insertQuestion({ profileId, title = null, questionText, optionList = null, transaction = null }) {
    const options = transaction ? { transaction } : {};
    return await this.Question.create(
      {
        profileId: profileId,
        title,
        questionText,
        optionList,
      },
      options
    );
  }

  async patchQuestionById({ questionId, patchData, fields = ["title", "questionText", "optionList"], transaction = null }) {
    const options = {};
    if (transaction) {
      options.transaction = transaction;
      options.lock = transaction.LOCK.UPDATE;
    }
    const question = await this.Question.findByPk(questionId, options);
    const originalData = question.toJSON();
    const updatedData = applyPatch(originalData, patchData).newDocument;
    return await question.update(updatedData, {
      fields,
      ...options,
    });
  }

  async getQuestionById(questionId) {
    return await this.Question.findByPk(questionId);
  }

  async getQuestionAndShareListByProfileId(profileId) {
    return await this.Question.findAll({
      where: {
        [Op.or]: [
          { profileId: profileId },
          {
            "$QuestionShare.receiverProfileId$": profileId,
          },
        ],
      },
      include: [
        {
          model: this.QuestionShare,
          as: "QuestionShare",
          attributes: [],
          group: ["questionId"],
        },
      ],
    });
  }
}

module.exports = new QuestionRepository();
