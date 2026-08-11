/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("questionShareEvent", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    questionShareId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    correlationId: {
      allowNull: true,
      type: Sequelize.UUID,
    },
    action: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    senderProfileId: {
      allowNull: false,
      type: Sequelize.UUID,
    },
    originalData: {
      allowNull: true,
      type: Sequelize.JSON,
    },
    actionData: {
      allowNull: false,
      type: Sequelize.JSON,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("questionShareEvent");
}
