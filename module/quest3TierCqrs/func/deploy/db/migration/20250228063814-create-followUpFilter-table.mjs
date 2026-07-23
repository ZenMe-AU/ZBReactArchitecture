/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable(
    "followUpFilter",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      order: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.SMALLINT,
      },
      senderProfileId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      refQuestionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      refOption: {
        allowNull: false,
        type: Sequelize.JSON,
      },
      newQuestionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      primaryKeys: ["id", "order"],
    }
  );
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("followUpFilter");
}
