/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Upgrade DB to the latest: node updateDbSchemaLocal.mjs
// Downgrade DB by one step: node updateDbSchemaLocal.mjs down

import { fileURLToPath } from "url";
import { resolve, dirname, sep } from "path";
import { classRunMigration } from "./classRunMigrationLocal.mjs";
import { createDatabaseInstance } from "../../repository/models/connection/index.mjs";
import dbType from "../../enum/dbType.mjs";
import { existsSync, readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const funcRoot = __dirname.split(`${sep}dist${sep}`)[0];
const migrationDir = resolve(__dirname, "migration");


(async () => {
  const settingsPath = resolve(funcRoot, "local.settings.json");
  if (existsSync(settingsPath)) {
    const raw = readFileSync(settingsPath, "utf8");
    const json = JSON.parse(raw);
    Object.assign(process.env, json.Values);
  } else {
    console.warn(`local.settings.json not found at ${settingsPath} - DB_* env vars will be unset. Run the compiled script (pnpm migrate:local), not the source file.`);
  }
  const envType = process.env.TF_VAR_env_type || "dev";
  // const moduleName = getModuleName(moduleDir);

  // const pgAdminUserName = process.env.TF_VAR_deployer_sp_name || getDbAdminName(envType); //"getDbSchemaAdminName(moduleName)";
  const config: Record<string, any> = {
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
