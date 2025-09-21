const { resolve } = require("path");
const fs = require("fs");
const MigrationRunner = require("@zenmechat/shared/deploy/migrationRunner.js");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { createDatabaseInstance } = require("@zenmechat/shared/db/connection");
const DB_TYPE = require("@zenmechat/shared/enum/dbType.js");
// const { getDbAdminName, getPgHost } = require("../util/namingConvention.js");

const moduleDir = resolve(__dirname, "..", "..", "..");
const migrationDir = resolve(__dirname, "..", "..", "db", "migration");

(async () => {
  const localSettingsPath = resolve(__dirname, "..", "..", "local.settings.json");
  if (!fs.existsSync(localSettingsPath)) {
    console.warn(`Error: file not found at ${localSettingsPath}`);
    return;
  }
  const settings = require(localSettingsPath);

  if (settings.Values) {
    for (const [key, value] of Object.entries(settings.Values)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  const envType = process.env.TF_VAR_env_type || "dev";
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
  const runner = new MigrationRunner({ db, migrationDir, envType, targetEnv });
  runner.firewallRuleName = null; // disable firewall rule for local dev
  await runner.run(direction);
})();
