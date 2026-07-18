/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("question", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    profileId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    title: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    questionText: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    option: {
      allowNull: true,
      type: Sequelize.JSON,
    },
    eventId: {
      allowNull: true,
      type: Sequelize.UUID,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });
  // await queryInterface.sequelize.query(
  //   'ALTER TABLE question ADD CONSTRAINT question_profile_id_fkey FOREIGN KEY ("profileId") REFERENCES profiles (id);'
  // );
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("question");
}
