/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { resolve } from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import classRunMigration from "./classRunMigration.js";
import __reqdew92u from "../../../../../deploy/util/envSetup.cjs";
const { getTargetEnv, getModuleName } = __reqdew92u;
import { createDatabaseInstance } from "../../repository/model/connection/index.js";
import DB_TYPE from "../../enum/dbType.js";
import __reqef2h2j from "../../../../../deploy/util/namingConvention.cjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { getDbAdminName, getPgHost } = __reqef2h2j;

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "migration");

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
