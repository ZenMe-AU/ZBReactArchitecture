"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("questionAction", {
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
      'ALTER TABLE "questionAction" ADD CONSTRAINT questionAction_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
      'ALTER TABLE "questionAction" ADD CONSTRAINT questionAction_profileId_fkey FOREIGN KEY ("profileId") REFERENCES profiles (id);'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("questionAction");
  },
};
