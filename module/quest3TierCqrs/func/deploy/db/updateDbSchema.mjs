/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { resolve } from "path";
import classRunMigration from "./classRunMigration.js";
import { getTargetEnv, getModuleName } from "../../../../../deploy/util/envSetup.cjs";
import { createDatabaseInstance } from "../../repository/model/connection/index.mjs";
import { POSTGRES } from "../../enum/dbType.js";
import { getDbAdminName, getPgHost } from "../../../../../deploy/util/namingConvention.cjs";

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "migration");

(async () => {
  const envType = process.env.TF_VAR_env_type || "dev";
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(moduleDir);

  const pgAdminUserName = process.env.TF_VAR_deployer_sp_name || getDbAdminName(envType); //"getDbSchemaAdminName(moduleName)";
  const db = await createDatabaseInstance(POSTGRES, {
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
