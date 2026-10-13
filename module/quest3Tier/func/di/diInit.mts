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

  // Register only one of sql or table repository into the DI container. This is intentionally not made configurable to avoid confusion.
  // TODO: Delete the repository that is not needed when you have confirmed your prefered data source choice.
// register("repository", async () => {
//   // Initialize SQL repository variable
//   const { initRepository: initSqlRepository } = await import("../repository/sql/repository.mjs");
//   const { repository: sqlRepository } = await initSqlRepository({
//     username: process.env.DB_USERNAME,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST,
//     authMode: process.env.DB_AUTH_MODE?? "azure-ad", // azure-ad is preferred for security.
//     password: process.env.DB_PASSWORD,
//     ignoreMigrationState: process.env.DB_IGNORE_MIGRATION_STATE,
//   });
//   console.log("SQL repository initialized");
//   container.register("repository", sqlRepository);
//   console.log("Repository registered with DI container");
// });

register("repository", async () => {
  // Initialize table repository variable
  const { initRepository:initTableRepository } = await import("../repository/table/repository.mjs");
  const tableRepository = initTableRepository({
    AzureWebJobsStorage: process.env.AzureWebJobsStorage,
    AzureWebJobsStorage__tableServiceUri: process.env.AzureWebJobsStorage__tableServiceUri,
    AzureWebJobsStorage__clientId: process.env.AzureWebJobsStorage__clientId,
  });
  console.log("Table repository initialized");
  container.register("repository", tableRepository);
  console.log("Repository registered with DI container");
});

(async () => {
  await startup();
})();
