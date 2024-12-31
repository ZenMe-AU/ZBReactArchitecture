"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("question_share", {
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
      senderId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      receiverId: {
        allowNull: false,
        type: Sequelize.INTEGER,
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
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE question_share ADD CONSTRAINT share_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
      'ALTER TABLE question_share ADD CONSTRAINT share_senderId_fkey FOREIGN KEY ("senderId") REFERENCES profiles (id);',
      'ALTER TABLE question_share ADD CONSTRAINT share_receiverId_fkey FOREIGN KEY ("receiverId") REFERENCES profiles (id);'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("question_share");
  },
};
