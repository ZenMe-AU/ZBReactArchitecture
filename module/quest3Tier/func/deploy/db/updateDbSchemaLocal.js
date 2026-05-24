/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { resolve } = require("path");
const classRunMigration = require("./classRunMigrationLocal.js");
const { getTargetEnv, getModuleName } = require("../../../../../deploy/util/envSetup.cjs");
const { createDatabaseInstance } = require("../../repository/model/connection/index.mjs");
const DB_TYPE = require("../../enum/dbType.js");
const { getDbAdminName, getPgHost } = require("../../../../../deploy/util/namingConvention.cjs");
const fs = require("fs");
const path = require("path");

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "migration");

(async () => {
  const settingsPath = path.resolve(__dirname, "../../local.settings.json");
  if (require.main === module && fs.existsSync(settingsPath)) {
    const raw = fs.readFileSync(settingsPath, "utf8");
    const json = JSON.parse(raw);
    Object.assign(process.env, json.Values);
  }

  const envType = process.env.TF_VAR_env_type || "dev";
  // const moduleName = getModuleName(moduleDir);

  // const pgAdminUserName = process.env.TF_VAR_deployer_sp_name || getDbAdminName(envType); //"getDbSchemaAdminName(moduleName)";
  const config = {
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
  };
  // for local development, use password auth if DB_PASSWORD is set
  if (process.env.DB_PASSWORD) {
    config.authMode = "password";
    config.password = process.env.DB_PASSWORD;
  }
  const db = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
  const direction = process.argv[2] || "up";
  await new classRunMigration({ db, migrationDir, envType }).run(direction);
})();
