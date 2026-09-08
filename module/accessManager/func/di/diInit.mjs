/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { register, startup } from "./diRegistry.mjs";
import container from "./diContainer.mjs";
import * as authEntraID from "../service/authEntraID.mjs";
import * as authLocal from "../service/authLocal.mjs";
import { questionRepository, rawQuestionClient } from "../repository/tableClient.mjs";

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

register("questionRepository", async () => {
  await rawQuestionClient.createTable();
  container.register("questionRepository", questionRepository);
  console.log("Azure Table Question repository initialized");
});

// register something else...(e.g. telemetry etc)
(async () => {
  await startup();
})();
