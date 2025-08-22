const { resolve } = require("path");
const DatabasePermissionManager = require("@zenmechat/shared/deploy/DatabasePermissionManager");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { createDatabaseInstance } = require("@zenmechat/shared/db/connection");
const DB_TYPE = require("@zenmechat/shared/enum/dbType");

/**
 * Naming convention helpers
 */
function getResourceGroupName(targetEnv) {
  return `${targetEnv}-resources`;
}
function getPgServerName(targetEnv) {
  return `${targetEnv}-postgresqlserver`;
}
function getPgHost(targetEnv) {
  return `${targetEnv}-postgresqlserver.postgres.database.azure.com`;
}
function getPgAdminUser(targetEnv) {
  return `${targetEnv}-pg-admins`;
}
function getFunctionAppName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-func`;
}
function getRwRoleName(moduleName) {
  return `${moduleName}_rw_group`;
}
function getRoRoleName(moduleName) {
  return `${moduleName}_ro_group`;
}
function getDbSchemaAdminRoleName(moduleName) {
  return `${moduleName}_schemaAdmin_role`;
}
function getDbSchemaAdminName(moduleName) {
  return `${moduleName}-dbschemaadmins`;
}

(async () => {
  //basic environment setup
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(resolve(__dirname, "..", "..", ".."));
  const functionAppName = getFunctionAppName(targetEnv, moduleName);
  const resourceGroupName = getResourceGroupName(targetEnv);
  const dbName = moduleName;
  // pg role/user name setup
  const pgServerName = getPgServerName(targetEnv);
  const pgAdminUserName = getPgAdminUser(targetEnv);
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
