/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("questionAnswer", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      questionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      profileId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      answerText: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      optionAnswerList: {
        allowNull: true,
        type: Sequelize.JSON,
      },
      when: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    // await queryInterface.sequelize.query(
    //   'ALTER TABLE "questionAnswer" ADD CONSTRAINT answers_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);'
    //   // 'ALTER TABLE "questionAnswer" ADD CONSTRAINT answers_profileId_fkey FOREIGN KEY ("profileId") REFERENCES profiles (id);'
    // );

    await queryInterface.addConstraint("questionAnswer", {
      fields: ["questionId"],
      type: "foreign key",
      name: "answers_questionId_fkey",
      references: {
        table: "question",
        field: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("questionAnswer", {
      fields: ["questionId", "profileId"],
      type: "unique",
      name: "question_profile_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("questionAnswer");
  },
};
