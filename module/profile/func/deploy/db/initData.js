/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Initialize or seed data to the database
import { resolve } from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { classRunMigration } from "./classRunMigration.js";
import __req6ime4c from "../../../../../deploy/util/envSetup.cjs";
const { getTargetEnv, getModuleName } = __req6ime4c;
import { createDatabaseInstance } from "../../repository/model/connection/index.js";
import { DB_TYPE } from "../../enum/dbType.js";
import __reqle0v8s from "../../../../../deploy/util/namingConvention.cjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { getDbAdminName, getPgHost } = __reqle0v8s;

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
