"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cmd", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      aggregateType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      eventId: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      correlationId: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      senderProfileId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      action: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      data: {
        allowNull: false,
        type: Sequelize.JSON,
      },
      status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("cmd");
  },
};
