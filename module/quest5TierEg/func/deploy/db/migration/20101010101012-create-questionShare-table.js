/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("questionShare", {
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
      status: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
      },
      type: {
        allowNull: false,
        type: Sequelize.SMALLINT,
        defaultValue: 0,
      },
    });

    // await queryInterface.sequelize.query(
    //   'ALTER TABLE question_share ADD CONSTRAINT share_questionId_fkey FOREIGN KEY ("questionId") REFERENCES question (id);',
    //   'ALTER TABLE question_share ADD CONSTRAINT share_senderId_fkey FOREIGN KEY ("senderId") REFERENCES profiles (id);',
    //   'ALTER TABLE question_share ADD CONSTRAINT share_receiverId_fkey FOREIGN KEY ("receiverId") REFERENCES profiles (id);'
    // );

    await queryInterface.addConstraint("questionShare", {
      fields: ["questionId"],
      type: "foreign key",
      name: "share_questionId_fkey",
      references: {
        table: "question",
        field: "id",
      },
      onDelete: "CASCADE",
    });

    // await queryInterface.addConstraint("questionShare", {
    //   fields: ["senderProfileId"],
    //   type: "foreign key",
    //   name: "share_senderId_fkey",
    //   references: {
    //     table: "profiles",
    //     field: "id",
    //   },
    //   onDelete: "CASCADE",
    // });

    // await queryInterface.addConstraint("questionShare", {
    //   fields: ["receiverProfileId"],
    //   type: "foreign key",
    //   name: "share_receiverId_fkey",
    //   references: {
    //     table: "profiles",
    //     field: "id",
    //   },
    //   onDelete: "CASCADE",
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("questionShare");
  },
};
