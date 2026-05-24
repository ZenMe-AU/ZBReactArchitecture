/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { resolve } from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import classManageDataPermission from "./classManageDataPermission.js";
import __req243ix2 from "../../../../../deploy/util/envSetup.cjs";
const { getTargetEnv, getModuleName } = __req243ix2;
import __requ6f19j from "../../repository/model/connection/index.js";
const { createDatabaseInstance } = __requ6f19j;
import DB_TYPE from "../../enum/dbType.js";
import __reqrqd2ra from "../../../../../deploy/util/namingConvention.cjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const {
  getFunctionAppName,
  getResourceGroupName,
  getPgServerName,
  getRwRoleName,
  getRoRoleName,
  getDbSchemaAdminName,
  getDbSchemaAdminRoleName,
  getDbAdminName,
  getPgHost,
} = __reqrqd2ra;

(async () => {
  //basic environment setup
  const envType = process.env.TF_VAR_env_type || "dev";
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(resolve(__dirname, "..", "..", ".."));
  const functionAppName = getFunctionAppName(targetEnv, moduleName);
  const resourceGroupName = getResourceGroupName(envType, targetEnv);
  const dbName = moduleName;
  // pg role/user name setup
  const pgServerName = getPgServerName(targetEnv);
  const pgAdminUserName = process.env.TF_VAR_deployer_sp_name || getDbAdminName(envType);
  const rwRoleName = getRwRoleName(moduleName);
  const roRoleName = getRoRoleName(moduleName);
  const dbSchemaAdminRoleName = getDbSchemaAdminRoleName(moduleName);
  const dbSchemaAdminUserName = getDbSchemaAdminName(moduleName);
  console.log("pgAdminUserName:", pgAdminUserName);
  // db connection setup
  const config = {
    username: pgAdminUserName,
    host: getPgHost(targetEnv),
    dialect: "postgres",
    database: dbName,
    port: 5432,
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  };
  const moduleDb = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
  const postgresDb = await createDatabaseInstance(DB_TYPE.POSTGRES, {
    ...config,
    database: "postgres",
  });
  const dbManager = new classManageDataPermission({
    targetEnv,
    moduleName,
    functionAppName,
    resourceGroupName,
    pgServerName,
    pgAdminUserName,
    moduleDb,
    postgresDb,
    dbName,
    rwRoleName,
    roRoleName,
    dbSchemaAdminRoleName,
    dbSchemaAdminUserName,
  });

  await dbManager.run();
})();
