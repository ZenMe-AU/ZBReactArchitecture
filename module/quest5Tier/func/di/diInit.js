/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const path = require("path");
const { register, startup } = require("./diRegistry");
const container = require("./diContainer");
const authEntraID = require("../service/authEntraID.js");
const authLocal = require("../service/authLocal.js");
const { createMigrationInstance } = require("../deploy/db/migration/tool/index.js");

async function assertNoPendingDbMigrations(sequelize) {
  const ignoreMigrationState = (process.env.DB_IGNORE_MIGRATION_STATE ?? "false").toLowerCase() === "true";
  if (ignoreMigrationState) {
    console.warn("DB migration-state check bypassed (DB_IGNORE_MIGRATION_STATE=true)");
    return;
  }

  //TODO: remove dependency on the deploy folder by generating a database migration state file that can be used to check that the database schema is up to date without needing to run the migration scripts.
  const migrationDir = path.join(__dirname, "..", "deploy", "db", "migration");
  const migration = createMigrationInstance({ db: sequelize, migrationDir });
  const pendingMigrations = await migration.pending();
  if (pendingMigrations.length === 0) {
    console.log("DB schema is up to date");
    return;
  }
  const isAzurePostgres = Boolean(process.env.DB_HOST && process.env.DB_HOST.includes("postgres.database.azure.com"));
  const upgradeCommand = isAzurePostgres ? "node ./deploy/db/updateDbSchema.mjs" : "node ./deploy/db/updateDbSchemaLocal.mjs";
  const pendingMigrationNames = pendingMigrations.map((migrationItem) => migrationItem.name).join(", ");
  throw new Error(
    [
      "Database schema is outdated. Startup is blocked until the DB is upgraded.",
      `Pending migrations: ${pendingMigrationNames}`,
      `Run this command with a schema-admin account: ${upgradeCommand}`,
      "Then restart the Function App.",
    ].join("\n")
  );
}
register("authProvider", async () => {
  const authProviders = {
    authEntraID,
    authLocal,
  };
  const authProviderName = process.env.AUTH_PROVIDER ?? "authEntraID";
  const authProviderModule = authProviders[authProviderName];
  container.register("authProvider", authProviderModule);
  console.log("🔐Auth provider initialized :", authProviders);
});
// register db
register("db", async () => {
  const { createDatabaseInstance } = require("../repository/model/connection");
  const { createModelsLoader } = require("../repository/model/loader/index");
  const DB_TYPE = require("../enum/dbType");
  const modelDir = path.join(__dirname, "..", "repository", "model");
  const config = {
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
  };
  // If a password is provided, use it even if using Azure Postgres, if azure postgres and no password then use azure-ad auth mode
  config.authMode = "password";
  if (process.env.DB_PASSWORD) {
    config.password = process.env.DB_PASSWORD;
  } else if (process.env.DB_HOST && process.env.DB_HOST.includes("postgres.database.azure.com")) {
    config.authMode = "azure-ad";
  }
  const sequelize = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
  await assertNoPendingDbMigrations(sequelize);
  const models = await createModelsLoader(DB_TYPE.POSTGRES, sequelize, modelDir);

  container.register("db", sequelize);
  container.register("models", models);

  // console.log(container.get("models"));
  console.log("🥳DB initialized");
});

// register serviceBus
register("serviceBus", async () => {
  const { createServiceBusInstance } = require("../serviceBus/connection");
  let sbClient = await createServiceBusInstance({
    namespace: process.env.ServiceBusConnection__fullyQualifiedNamespace,
    clientId: process.env.ServiceBusConnection__clientId || null,
  });
  // for local development, use connection string if ServiceBusConnection is set
  if (process.env.ServiceBusConnection && process.env.ServiceBusConnection.startsWith("Endpoint=sb://localhost")) {
    sbClient = await createServiceBusInstance({
      namespace: process.env.ServiceBusConnection__fullyQualifiedNamespace,
      connectionString: process.env.ServiceBusConnection,
    });
  }
  container.register("serviceBus", sbClient);
  console.log("🥳serviceBus initialized");
});
// register something else...(e.g. telemetry etc)
(async () => {
  await startup();
})();
