/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import path from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import __reqnk5yhl from "./diRegistry.js";
import __reqyaxa5h from "../repository/model/connection/index.js";
import __reqvg8yy7 from "../repository/model/loader/index.js";
import DB_TYPE from "../enum/dbType.js";
const { register, startup } = __reqnk5yhl;
const { createDatabaseInstance } = __reqyaxa5h;
const { createModelsLoader } = __reqvg8yy7;
import container from "./diContainer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// register db

// register db
register("db", async () => {
  const modelDir = path.join(__dirname, "..", "repository", "model");
  const config = {
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
  };
  // for local development, use password auth if DB_PASSWORD is set
  if (process.env.DB_PASSWORD) {
    config.authMode = "password";
    config.password = process.env.DB_PASSWORD;
  }
  const sequelize = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
  const models = await createModelsLoader(DB_TYPE.POSTGRES, sequelize, modelDir);

  container.register("db", sequelize);
  container.register("models", models);

  console.log(container.get("models"));
  console.log("🥳DB initialized");
});

// register something else...(e.g. telemetry etc)
(async () => {
  await startup();
})();
