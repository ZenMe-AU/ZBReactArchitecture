/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Initialize or seed data to the database
const { resolve } = require("path");
const classRunMigration = require("./classRunMigration.js");
const { getTargetEnv, getModuleName } = require("../../../../../deploy/util/envSetup.cjs");
const { createDatabaseInstance } = require("../../repository/model/connection/index.js");
const DB_TYPE = require("../../enum/dbType.js");
const { getDbAdminName, getPgHost } = require("../../../../../deploy/util/namingConvention.cjs");

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "seeder");

(async () => {
  const envType = process.env.TF_VAR_env_type || "dev";
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(moduleDir);

  const pgAdminUserName = process.env.TF_VAR_deployer_sp_name || getDbAdminName(envType); //"getDbSchemaAdminName(moduleName)";
  const db = await createDatabaseInstance(DB_TYPE.POSTGRES, {
    username: pgAdminUserName,
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
  await new classRunMigration({ db, migrationDir, envType, targetEnv }).run(direction);
})();
