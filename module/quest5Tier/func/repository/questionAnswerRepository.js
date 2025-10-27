/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const BaseRepository = require("./baseRepository");
const { Op, Sequelize, QueryTypes, literal } = require("sequelize");

class QuestionAnswerRepository extends BaseRepository {
  constructor() {
    super(["QuestionAnswer"]);
  }

  async upsertAnswerByQuestionId({ questionId, profileId, ansData, transaction = null }) {
    const options = {};
    if (transaction) {
      options.transaction = transaction;
      options.lock = transaction.LOCK.UPDATE;
    }
    const { answer: answerText = null, option: optionAnswerList = null, duration, when = null } = ansData;
    const [instance, created] = await this.QuestionAnswer.upsert(
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
    return instance;
  }

  async getAnswerById(answerId) {
    return await this.QuestionAnswer.findByPk(answerId);
  }

  async getAnswerListByQuestionId(questionId) {
    return await await this.QuestionAnswer.sequelize.query(
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
        type: this.QuestionAnswer.sequelize.QueryTypes.SELECT,
      }
    );
  }
}

module.exports = new QuestionAnswerRepository();
