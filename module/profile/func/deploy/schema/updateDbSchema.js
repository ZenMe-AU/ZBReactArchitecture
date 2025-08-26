const { resolve } = require("path");
const MigrationRunner = require("@zenmechat/shared/deploy/migrationRunner.js");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { createDatabaseInstance } = require("@zenmechat/shared/db/connection");
const DB_TYPE = require("@zenmechat/shared/enum/dbType");
const { getDbAdminName } = require("@zenmechat/shared/deploy/util/namingConvention");

/**
 * Naming convention helpers
 */
function getPgHost(targetEnv) {
  return `${targetEnv}-postgresqlserver.postgres.database.azure.com`;
}
const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "..", "..", "db", "migration");

(async () => {
  const targetEnv = getTargetEnv();
  const moduleName = getModuleName(moduleDir);

  const db = await createDatabaseInstance(DB_TYPE.POSTGRES, {
    username: getDbAdminName(envType), //"getDbSchemaAdminName(moduleName)";
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
  await new MigrationRunner({ db, migrationDir }).run(direction);
})();
