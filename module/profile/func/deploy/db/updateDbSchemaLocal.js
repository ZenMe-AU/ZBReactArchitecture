/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { resolve } from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import classRunMigration from "./classRunMigrationLocal.js";
import __reqcgadm0 from "../../../../../deploy/util/envSetup.cjs";
const { getTargetEnv, getModuleName } = __reqcgadm0;
import { createDatabaseInstance } from "../../repository/model/connection/index.js";
import DB_TYPE from "../../enum/dbType.js";
import __reqtlnuzi from "../../../../../deploy/util/namingConvention.cjs";
const { getDbAdminName, getPgHost } = __reqtlnuzi;
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "migration");

(async () => {
  const settingsPath = path.resolve(__dirname, "../../local.settings.json");
  if (fs.existsSync(settingsPath)) {
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
  console.log("🚧 Starting migration with config:", config);
  const db = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
  const direction = process.argv[2] || "up";
  await new classRunMigration({ db, migrationDir, envType }).run(direction);
})();
