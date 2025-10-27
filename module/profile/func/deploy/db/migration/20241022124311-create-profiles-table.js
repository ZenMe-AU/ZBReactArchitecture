/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("profiles", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      avatar: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      deviceId: {
        type: Sequelize.STRING,
      },
    });
    // await queryInterface.sequelize.query("ALTER TABLE profiles ADD CONSTRAINT profile_userId_fkey FOREIGN KEY (userId) REFERENCES users (id);");

    // await queryInterface.addConstraint("profiles", {
    //   fields: ["userId"],
    //   type: "foreign key",
    //   name: "profiles_userId_fkey",
    //   references: {
    //     table: "users",
    //     field: "id",
    //   },
    //   onDelete: "CASCADE",
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("profiles");
  },
};
