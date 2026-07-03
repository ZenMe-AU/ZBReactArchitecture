/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
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
    optionId: {
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
  });
  await queryInterface.sequelize.query(
    'ALTER TABLE "questionAnswer" ADD CONSTRAINT answers_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);'
    // 'ALTER TABLE "questionAnswer" ADD CONSTRAINT answers_profileId_fkey FOREIGN KEY ("profileId") REFERENCES profiles (id);'
  );
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("questionAnswer");
}
