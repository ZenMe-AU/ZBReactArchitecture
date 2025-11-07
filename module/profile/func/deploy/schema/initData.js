/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Initialize or seed data to the database
const { resolve } = require("path");
const MigrationRunner = require("../db/migrationRunner");
const { getTargetEnv, getModuleName } = require("../util/envSetup.js");
const { createDatabaseInstance } = require("../../repository/model/connection");
const DB_TYPE = require("../enum/dbType");
const { getDbAdminName } = require("../util/namingConvention");

/**
 * Naming convention helpers
 */
function getPgHost(targetEnv) {
  return `${targetEnv}-postgresqlserver.postgres.database.azure.com`;
}
const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "..", "db", "seeder");

(async () => {
  const envType = process.env.TF_VAR_env_type || "dev";
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(moduleDir);

  const db = await createDatabaseInstance(DB_TYPE.POSTGRES, {
    username: getDbAdminName(envType), //"getDbSchemaAdminName(moduleName)";
    host: getPgHost(targetEnv),
    dialect: "postgres",
    port: 5432,
    database: moduleName,
    logging: false,
    dialectOptions: {
      ssl: true,
    },
  });
  const direction = process.argv[2] || "up";
  await new MigrationRunner({ db, migrationDir, envType, targetEnv }).run(direction);
})();
