"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("followUpCmd", {
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
      refQuestionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      questionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      option: {
        allowNull: false,
        type: Sequelize.JSON,
      },
      isSave: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("followUpCmd");
  },
};
