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
      newQuestionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      senderProfileId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      receiverProfileId: {
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
