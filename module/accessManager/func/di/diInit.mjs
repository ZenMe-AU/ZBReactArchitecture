/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { register, startup } from "./diRegistry.mjs";
import container from "./diContainer.mjs";
import * as authEntraID from "../service/authEntraID.mjs";
import * as authLocal from "../service/authLocal.mjs";
import { initialiseTables } from "../repository/tableClient.mjs";
import {
  questionRepository,
  questionAnswerRepository,
  profileRepository,
  questionActionRepository,
  followUpCmdRepository,
  followUpEventRepository,
} from "../repository/tableClient.mjs";

import {
  storageConnectionString,
  useDevelopmentStorage,
  accountName,
  accountKey,
  endpoint,
  credential,
} from "./azureTableConfig.mjs";

// TO DO: credentials and connections passed to repository from diinit
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

// TO DO: Move table creation to tableClient
register("tables", async () => {
  await initialiseTables();
});

// Register repositories
register("respositories", async () => {
  container.register("questionRepository", questionRepository);
  container.register("questionAnswerRepository", questionAnswerRepository);
  container.register("profileRepository", profileRepository);
  container.register("questionActionRepository", questionActionRepository)
  container.register("followUpCmdRepository", followUpCmdRepository)
  container.register("followUpEventRepository", followUpEventRepository)
});

// register something else...(e.g. telemetry etc)
(async () => {
  await startup();
})();
