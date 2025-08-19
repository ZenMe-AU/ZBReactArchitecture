const { resolve } = require("path");
const MigrationRunner = require("@zenmechat/shared/deploy/migrationRunner.js");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { createDatabaseInstance } = require("@zenmechat/shared/db/connection");
const DB_TYPE = require("@zenmechat/shared/enum/dbType");

/**
 * Naming convention helpers
 */
function getPgHost(targetEnv) {
  return `${targetEnv}-postgresqlserver.postgres.database.azure.com`;
}
function getPgAdminUser(targetEnv) {
  return `${targetEnv}-pg-admins`;
}
function getDbSchemaAdminName(moduleName) {
  return `${moduleName}-dbschemaadmins`;
}

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "..", "..", "db", "migration");

(async () => {
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(moduleDir);
  const pgHost = getPgHost(targetEnv);
  const pgPort = 5432;
  const pgDatabase = moduleName;
  const pgDialect = "postgres";
  const aadGroup = getPgAdminUser(targetEnv);
  // const aadGroup = "getDbSchemaAdminName(moduleName)";

  const db = await createDatabaseInstance(DB_TYPE.POSTGRES, {
    username: aadGroup,
    host: pgHost,
    dialect: pgDialect,
    port: pgPort,
    database: pgDatabase,
    logging: false,
    dialectOptions: {
      ssl: true,
    },
  });
  const direction = process.argv[2] || "up";
  await new MigrationRunner({ db, migrationDir }).run(direction);
})();
