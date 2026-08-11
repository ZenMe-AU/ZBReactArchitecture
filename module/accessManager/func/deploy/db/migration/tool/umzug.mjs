/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { basename, join } from "path";
import { pathToFileURL } from "url";
import { Umzug, SequelizeStorage } from "umzug";
import { Sequelize } from "sequelize";

function createUmzugInstance(sequelize, migrationDir) {
  return new Umzug({
    migrations: {
      glob: join(migrationDir, "*.{mjs,cjs,js}").replace(/\\/g, "/"),
      resolve: ({ name, path, context }) => {
        const migrationName = name ?? basename(path);
        const migrationModule = import(pathToFileURL(path).href);
        return {
          name: migrationName,
          up: async () => {
            const migration = await migrationModule;
            return migration.up(context.queryInterface, Sequelize);
          },
          down: async () => {
            const migration = await migrationModule;
            return migration.down(context.queryInterface, Sequelize);
          },
        };
      },
    },
    context: { queryInterface: sequelize.getQueryInterface() },
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });
}

export { createUmzugInstance };
