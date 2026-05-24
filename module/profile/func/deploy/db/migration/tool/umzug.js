/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import path from "path";
import { pathToFileURL } from "node:url";
import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";

function createUmzugInstance(sequelize, migrationDir) {
  return new Umzug({
    migrations: {
      glob: path.join(migrationDir, "*.js").replace(/\\/g, "/"),
      resolve: ({ name, path: migrationPath, context }) => {
        return {
          name,
          up: async () => {
            const migration = await import(pathToFileURL(migrationPath).href);
            return migration.default.up(context.queryInterface, Sequelize);
          },
          down: async () => {
            const migration = await import(pathToFileURL(migrationPath).href);
            return migration.default.down(context.queryInterface, Sequelize);
          },
        };
      },
    },
    context: { queryInterface: sequelize.getQueryInterface() },
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });
}

export default { createUmzugInstance };
