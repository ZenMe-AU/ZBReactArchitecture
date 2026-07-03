/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import path from "path";
import { fileURLToPath } from "url";
import { register, startup } from "./diRegistry.mjs";
import container from "./diContainer.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

register("authProvider", async () => {
  const authProviderName = process.env.AUTH_PROVIDER || "authEntraID.mjs";
  const authProviderModule = await import(`../service/${authProviderName}`);
  container.register("authProvider", authProviderModule);
  console.log("🥳Auth provider initialized");
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

  if (process.env.DB_PASSWORD) {
    config.authMode = "password";
    config.password = process.env.DB_PASSWORD;
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
