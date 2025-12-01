/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { resolve } = require("path");
const fs = require("fs");
const MigrationRunner = require("../db/migrationRunner.js");
const {
  getTargetEnv,
  getModuleName,
} = require("../../../../../deploy/util/envSetup.cjs");
const {
  createDatabaseInstance,
} = require("../../repository/model/connection/index.js");
const DB_TYPE = require("../../enum/dbType.js");
// const { getDbAdminName, getPgHost } = require("../../../../../deploy/util/namingConvention.cjs");

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "..", "db", "migration");

(async () => {
  const localSettingsPath = resolve(
    __dirname,
    "..",
    "..",
    "local.settings.json",
  );
  if (!fs.existsSync(localSettingsPath)) {
    console.warn(`Error: file not found at ${localSettingsPath}`);
    return;
  }
  const settings = require(localSettingsPath);

  if (settings.Values) {
    for (const [key, value] of Object.entries(settings.Values)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  const envType = process.env.TF_VAR_env_type || "dev";
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(moduleDir);

  const db = await createDatabaseInstance(DB_TYPE.POSTGRES, {
    authMode: process.env.DB_PASSWORD ? "password" : "azure-ad",
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE || moduleName,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD || null,
  });
  const direction = process.argv[2] || "up";
  const runner = new MigrationRunner({ db, migrationDir, envType, targetEnv });
  runner.firewallRuleName = null; // disable firewall rule for local dev
  await runner.run(direction);
})();
