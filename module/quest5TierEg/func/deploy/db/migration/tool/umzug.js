/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const path = require("path");
const { Umzug, SequelizeStorage } = require("umzug");
const { Sequelize } = require("sequelize");

function createUmzugInstance(sequelize, migrationDir) {
  return new Umzug({
    migrations: {
      glob: path.join(migrationDir, "*.js"),
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: async () => migration.up(context.queryInterface, Sequelize),
          down: async () => migration.down(context.queryInterface, Sequelize),
        };
      },
    },
    context: { queryInterface: sequelize.getQueryInterface() },
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });
}

module.exports = { createUmzugInstance };
