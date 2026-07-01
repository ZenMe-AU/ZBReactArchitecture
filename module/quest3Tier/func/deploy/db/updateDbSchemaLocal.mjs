/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Upgrade DB to the latest: node updateDbSchemaLocal.mjs
// Downgrade DB by one step: node updateDbSchemaLocal.mjs down

import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import { classRunMigration } from "./classRunMigrationLocal.mjs";
import { createDatabaseInstance } from "../../repository/model/connection/index.mjs";
import dbType from "../../enum/dbType.mjs";
import { existsSync, readFileSync } from "fs";
import { resolve as _resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationDir = resolve(__dirname, "migration");

(async () => {
  const settingsPath = _resolve(__dirname, "../../local.settings.json");
  if (existsSync(settingsPath)) {
    const raw = readFileSync(settingsPath, "utf8");
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
  const db = await createDatabaseInstance(dbType.POSTGRES, config);
  const direction = process.argv[2] || "up";
  await new classRunMigration({ db, migrationDir, envType }).run(direction);
})();
