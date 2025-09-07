"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("logQuestion", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      questionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      action: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      profileId: {
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
      lastEventId: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE "logQuestion" ADD CONSTRAINT logQuestionQuestionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
      // 'ALTER TABLE "logQuestion" ADD CONSTRAINT logQuestion_profileId_fkey FOREIGN KEY ("profileId") REFERENCES profiles (id);',
      'ALTER TABLE "logQuestion" ADD CONSTRAINT logQuestion_lastEventId_fkey FOREIGN KEY ("lastEventId") REFERENCES logQuestion (id);'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("logQuestion");
  },
};
