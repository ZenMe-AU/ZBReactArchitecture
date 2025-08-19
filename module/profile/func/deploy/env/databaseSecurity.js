const { resolve } = require("path");
const { getTargetEnv, getModuleName, getCurrentPublicIP } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { getFunctionAppPrincipalId, addTemporaryFirewallRule, removeTemporaryFirewallRule } = require("@zenmechat/shared/deploy/util/azureCli.js");
const {
  createDbReadWriteRole,
  createDbReadOnlyRole,
  createDbSchemaAdminRole,
  createAadLoginRole,
  grantRole,
} = require("@zenmechat/shared/deploy/util/postgresql.js");
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

const firewallRuleName = "temp-access-rule";
const moduleDir = resolve(__dirname, "..", "..", "..");

(async function main() {
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(moduleDir);
  const ipAddress = getCurrentPublicIP();

  const resourceGroupName = getResourceGroupName(targetEnv);
  const functionAppName = getFunctionAppName(targetEnv, moduleName);
  const functionAppPrincipalId = getFunctionAppPrincipalId({ functionAppName, resourceGroupName });

  const dbName = moduleName;
  const adminUserName = getPgAdminUser(targetEnv);
  const pgHost = getPgHost(targetEnv);
  const config = {
    username: adminUserName,
    host: pgHost,
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

  addTemporaryFirewallRule({ resourceGroup: resourceGroupName, serverName: getPgServerName(targetEnv), ruleName: firewallRuleName, ip: ipAddress });

  try {
    await createAadLoginRole(postgresDb, functionAppName, functionAppPrincipalId);
    await createDbReadWriteRole(moduleDb, getRwRoleName(moduleName), dbName);
    await createDbReadOnlyRole(moduleDb, getRoRoleName(moduleName), dbName);
    await createDbSchemaAdminRole(moduleDb, getDbSchemaAdminRoleName(moduleName), dbName);
    await grantRole(moduleDb, getRwRoleName(moduleName), functionAppName);
    await grantRole(moduleDb, getDbSchemaAdminRoleName(moduleName), adminUserName); // for development
    // await grantRole(moduleDb, getDbSchemaAdminRoleName(moduleName), getDbSchemaAdminName(moduleName));// for development
  } catch (err) {
    console.error("Failed to set up database roles:", err.message);
  } finally {
    await moduleDb.close();
    await postgresDb.close();
    removeTemporaryFirewallRule({ resourceGroup: resourceGroupName, serverName: getPgServerName(targetEnv), ruleName: firewallRuleName });
  }
})();
