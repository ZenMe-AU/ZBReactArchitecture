"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("question_action", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      profileId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      questionId: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      action: {
        allowNull: true,
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE question_action ADD CONSTRAINT question_action_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
      'ALTER TABLE question_action ADD CONSTRAINT question_action_profileId_fkey FOREIGN KEY ("profileId") REFERENCES profiles (id);'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("question_action");
  },
};
