/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { register, startup } from "./diRegistry.mjs";
import container from "./diContainer.mjs";
import * as authEntraID from "../service/authEntraID.mjs";
import * as authLocal from "../service/authLocal.mjs";

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
  const { initDbConnection } = await import("../sqlRepository/initDbConnection.mjs");
  const { sequelize, models } = await initDbConnection();

  container.register("db", sequelize);
  container.register("models", models);
  console.log("🥳DB initialized");
});

(async () => {
  await startup();
})();
