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
      isSave: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("followUpCmd");
  },
};
