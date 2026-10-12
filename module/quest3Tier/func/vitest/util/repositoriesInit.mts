import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initRepository as initializeSqlRepository } from "../../repository/sql/repository.mjs";
import { initRepository as initializeTableRepository } from "../../repository/table/repository.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadLocalSettingsIntoEnv() {
  const settingsPath = path.join(__dirname, "..", "..", "local.settings.json");
  if (!fs.existsSync(settingsPath)) return;

  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  if (settings?.Values) Object.assign(process.env, settings.Values);
}

export async function initSqlRepository() {
  loadLocalSettingsIntoEnv();
  return initializeSqlRepository({
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    authMode: process.env.DB_AUTH_MODE ?? "azure-ad",
    password: process.env.DB_PASSWORD,
    ignoreMigrationState: process.env.DB_IGNORE_MIGRATION_STATE,
  });
}

export function initTableRepository() {
  loadLocalSettingsIntoEnv();
  return initializeTableRepository({
    AzureWebJobsStorage: process.env.AzureWebJobsStorage,
    AzureWebJobsStorage__tableServiceUri: process.env.AzureWebJobsStorage__tableServiceUri,
    AzureWebJobsStorage__clientId: process.env.AzureWebJobsStorage__clientId,
  });
}