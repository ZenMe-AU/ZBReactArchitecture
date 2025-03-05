"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("followUpShare", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      refQuestionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      questionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      senderId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      receiverId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("followUpShare");
  },
};
