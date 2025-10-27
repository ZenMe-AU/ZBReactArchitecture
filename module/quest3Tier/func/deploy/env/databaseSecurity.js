/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { resolve } = require("path");
const DatabasePermissionManager = require("./databasePermissionManager.js");
const { getTargetEnv, getModuleName } = require("../util/envSetup.js");
const { createDatabaseInstance } = require("../../repository/model/connection");
const DB_TYPE = require("../../enum/dbType.js");
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
} = require("../util/namingConvention.js");

(async () => {
  //basic environment setup
  const envType = process.env.TF_VAR_env_type;
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(resolve(__dirname, "..", "..", ".."));
  const functionAppName = getFunctionAppName(targetEnv, moduleName);
  const resourceGroupName = getResourceGroupName(envType, targetEnv);
  const dbName = moduleName;
  // pg role/user name setup
  const pgServerName = getPgServerName(targetEnv);
  const pgAdminUserName = getDbAdminName(envType);
  const rwRoleName = getRwRoleName(moduleName);
  const roRoleName = getRoRoleName(moduleName);
  const dbSchemaAdminRoleName = getDbSchemaAdminRoleName(moduleName);
  const dbSchemaAdminUserName = getDbSchemaAdminName(moduleName);
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
  const dbManager = new DatabasePermissionManager({
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
