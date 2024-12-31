"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("log_question", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      questionId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      action: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      profileId: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE log_question ADD CONSTRAINT log_question_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
      'ALTER TABLE log_question ADD CONSTRAINT log_question_profileId_fkey FOREIGN KEY ("profileId") REFERENCES profiles (id);',
      'ALTER TABLE log_question ADD CONSTRAINT log_question_lastEventId_fkey FOREIGN KEY ("lastEventId") REFERENCES log_question (id);'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("log_question");
  },
};
