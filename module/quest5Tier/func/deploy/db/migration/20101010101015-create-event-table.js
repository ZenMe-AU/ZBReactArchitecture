/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("event", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      aggregateId: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      aggregateType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      causationId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      causationType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      correlationId: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      senderProfileId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      eventType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      eventData: {
        allowNull: false,
        type: Sequelize.JSON,
      },
      originalData: {
        allowNull: true,
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("event");
  },
};
