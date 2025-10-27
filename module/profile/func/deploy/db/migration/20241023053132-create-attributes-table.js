/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attributes", {
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
      tag: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    // await queryInterface.sequelize.query(
    //   "ALTER TABLE attributes ADD CONSTRAINT attributes_profileId_fkey FOREIGN KEY (profileId) REFERENCES profiles (id);"
    // );
    // await queryInterface.addConstraint("attributes", {
    //   fields: ["profileId"],
    //   type: "foreign key",
    //   name: "attributes_profileId_fkey",
    //   references: {
    //     table: "profiles",
    //     field: "id",
    //   },
    //   onDelete: "CASCADE",
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("attributes");
  },
};
