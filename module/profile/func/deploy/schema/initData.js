// Initialize or seed data to the database
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
const migrationDir = resolve(__dirname, "..", "..", "db", "seeder");

(async () => {
  const envType = process.env.TF_VAR_env_type;
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
  await new MigrationRunner({ db, migrationDir, envType, targetEnv }).run(direction);
})();
