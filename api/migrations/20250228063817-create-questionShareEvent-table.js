"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
        allowNull: false,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("questionShareEvent");
  },
};
