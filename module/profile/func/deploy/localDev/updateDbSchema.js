/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { resolve } from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import fs from "fs";
import MigrationRunner from "../db/classRunMigrationLocal.js";
import __reqc5tkmz from "../../../../../deploy/util/envSetup.cjs";
const { getTargetEnv, getModuleName } = __reqc5tkmz;
import __reqfrttgf from "../../repository/model/connection/index.js";
const { createDatabaseInstance } = __reqfrttgf;
import DB_TYPE from "../../enum/dbType.js";
// const { getDbAdminName, getPgHost } = require("../../../../../deploy/util/namingConvention.cjs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "..", "db", "migration");

(async () => {
  const localSettingsPath = resolve(__dirname, "..", "..", "local.settings.json");
  if (!fs.existsSync(localSettingsPath)) {
    console.warn(`Error: file not found at ${localSettingsPath}`);
    return;
  }
  const settings = JSON.parse(fs.readFileSync(localSettingsPath, "utf8"));

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
    authMode: "password",
    username: "root",
    database: "profile",
    host: "localhost",
    password: "DatabasePassword123!",
  });
  const direction = process.argv[2] || "up";
  const runner = new MigrationRunner({ db, migrationDir, envType, targetEnv });
  runner.firewallRuleName = null; // disable firewall rule for local dev
  await runner.run(direction);
})();
