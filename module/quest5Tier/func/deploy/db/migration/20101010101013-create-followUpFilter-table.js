"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "followUpFilter",
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        order: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.SMALLINT,
        },
        senderProfileId: {
          allowNull: false,
          type: Sequelize.UUID,
        },
        refQuestionId: {
          allowNull: false,
          type: Sequelize.UUID,
        },
        refOption: {
          allowNull: false,
          type: Sequelize.JSON,
        },
        questionIdList: {
          allowNull: false,
          type: Sequelize.JSON,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      },
      {
        primaryKeys: ["id", "order"],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("followUpFilter");
  },
};
