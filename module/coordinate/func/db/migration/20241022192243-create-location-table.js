/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("CREATE EXTENSION IF NOT EXISTS postgis;");
    await queryInterface.createTable("location", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      topicId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tid: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lat: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      lon: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      response: {
        type: Sequelize.TEXT,
      },
      geom: {
        type: Sequelize.GEOMETRY("POINT", 4326),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // await queryInterface.addConstraint("location", {
    //   fields: ["tid"],
    //   type: "foreign key",
    //   name: "location_tid_fkey",
    //   references: {
    //     table: "profiles",
    //     field: "deviceId",
    //   },
    //   onDelete: "CASCADE",
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("location");
  },
};
