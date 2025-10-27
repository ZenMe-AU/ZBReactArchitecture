/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const path = require("path");
const { register, startup } = require("./diRegistry");
const container = require("./diContainer");

// register db
console.log("register db");
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
  // for local development, use password auth if DB_PASSWORD is set
  if (process.env.DB_PASSWORD) {
    config.authMode = "password";
    config.password = process.env.DB_PASSWORD;
  }
  const sequelize = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
  const models = createModelsLoader(DB_TYPE.POSTGRES, sequelize, modelDir);

  container.register("db", sequelize);
  container.register("models", models);

  // console.log(container.get("models"));
  console.log("🥳DB initialized");
});

// // register serviceBus
// console.log("register serviceBus");
// register("serviceBus", async () => {
//   const { createServiceBusInstance } = require("../serviceBus/connection");
//   let sbClient = await createServiceBusInstance({
//     namespace: process.env.ServiceBusConnection__fullyQualifiedNamespace,
//     clientId: process.env.ServiceBusConnection__clientId || null,
//   });
//   // for local development, use connection string if ServiceBusConnection is set
//   if (process.env.ServiceBusConnection && process.env.ServiceBusConnection.startsWith("Endpoint=sb://localhost")) {
//     sbClient = await createServiceBusInstance({
//       namespace: process.env.ServiceBusConnection__fullyQualifiedNamespace,
//       connectionString: process.env.ServiceBusConnection,
//     });
//   }
//   container.register("serviceBus", sbClient);
//   console.log("🥳serviceBus initialized");
// });

// register eventGrid
console.log("register eventGrid");
register("eventGrid", async () => {
  const eventGridClientType = process.env.EventQueueType; // standard or namespace or domain
  const eventGridFactory = require("../eventGrid/clientFactory");
  // const topicNameList = require("../eventGrid/topicNameList");
  // const funcMetaData = require("../funcMetaData.js");

  let clientSettings = {
    type: eventGridClientType,
    endpoint: process.env.EventGridConnection__topicEndpointUri,
    clientId: process.env.EventGridConnection__clientId || null,
    // key:process.env.EventGridConnection && process.env.EventGridConnection.startsWith("Endpoint=sb://localhost") ? process.env.EventGridConnection : null,
  };
  // const clients = {};
  // Object.values(topicNameList).forEach((topic) => {
  //   clients[topic] = eventGridFactory.getClient({ ...clientSettings, topic });
  // });
  const client = eventGridFactory.getClient({ ...clientSettings });
  container.register("eventGrid", client);
  console.log("🥳eventGrid initialized");
});

// register something else...(e.g. telemetry etc)
(async () => {
  await startup();
})();
