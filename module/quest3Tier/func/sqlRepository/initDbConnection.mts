/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import path from "path";
import { fileURLToPath } from "url";
import { createMigrationInstance } from "../deploy/db/migration/tool/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export async function initDbConnection() {
  const { createDatabaseInstance } = await import("./models/connection/index.mjs");
  const { initRepository } = await import("./repository.mjs");
  const DB_TYPE = (await import("../enum/dbType.mjs")).default;

  const config: Record<string, any> = {
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
  const models = initRepository(sequelize);

  return { sequelize, models };
}