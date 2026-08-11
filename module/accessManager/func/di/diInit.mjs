/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import path from "path";
import { fileURLToPath } from "url";
import { register, startup } from "./diRegistry.mjs";
import container from "./diContainer.mjs";
import * as authEntraID from "../service/authEntraID.mjs";
import * as authLocal from "../service/authLocal.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const { createDatabaseInstance } = await import("../repository/model/connection/index.mjs");
  const { createModelsLoader } = await import("../repository/model/loader/index.mjs");
  const DB_TYPE = (await import("../enum/dbType.mjs")).default;

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
  const models = createModelsLoader(DB_TYPE.POSTGRES, sequelize, modelDir);

  container.register("db", sequelize);
  container.register("models", models);
  console.log("🥳DB initialized");
});

// register something else...(e.g. telemetry etc)
(async () => {
  await startup();
})();
