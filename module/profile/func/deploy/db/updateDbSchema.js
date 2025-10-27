/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { resolve } = require("path");
const MigrationRunner = require("./migrationRunner.js");
const { getTargetEnv, getModuleName } = require("../util/envSetup.js");
const { createDatabaseInstance } = require("../../repository/model/connection/index.js");
const DB_TYPE = require("../../enum/dbType.js");
const { getDbAdminName, getPgHost } = require("../util/namingConvention.js");

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "migration");

(async () => {
  const envType = process.env.TF_VAR_env_type;
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
