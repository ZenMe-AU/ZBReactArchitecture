/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { join } from "path";
import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";

async function createUmzugInstance(sequelize, migrationDir) {
  return new Umzug({
    migrations: {
      glob: join(migrationDir, "*.js").replace(/\\/g, "/"),
      resolve: async ({ name, path, context }) => {
        const migration = await import(path);
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

export { createUmzugInstance };
