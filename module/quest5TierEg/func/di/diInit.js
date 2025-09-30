const path = require("path");
const { register, startup } = require("./diRegistry");
const container = require("./diContainer");

// register db
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

// register serviceBus
register("serviceBus", async () => {
  const { createServiceBusInstance } = require("../serviceBus/connection");
  let sbClient = await createServiceBusInstance({
    namespace: process.env.ServiceBusConnection__fullyQualifiedNamespace,
    clientId: process.env.ServiceBusConnection__clientId || null,
  });
  // for local development, use connection string if ServiceBusConnection is set
  if (process.env.ServiceBusConnection && process.env.ServiceBusConnection.startsWith("Endpoint=sb://localhost")) {
    sbClient = await createServiceBusInstance({
      namespace: process.env.ServiceBusConnection__fullyQualifiedNamespace,
      connectionString: process.env.ServiceBusConnection,
    });
  }
  container.register("serviceBus", sbClient);
  console.log("🥳serviceBus initialized");
});

// register eventGrid
register("eventGrid", async () => {
  const { createEventGridInstance } = require("../eventGrid/connection");

  let egClient = createEventGridInstance({
    endpoint: process.env.EventGridConnection__topicEndpointUri,
    clientId: process.env.EventGridConnection__clientId || null,
  });
  // for local development, use connection string if EVENT_GRID_CONNECTION is set
  // if (process.env.EventGridConnection && process.env.EventGridConnection.startsWith("Endpoint=sb://localhost")) {
  //   egClient = await createEventGridInstance({
  //     endpoint: process.env.EventGridConnection__topicEndpointUri,
  //     key: process.env.EventGridConnection,
  //   });
  // }
  container.register("eventGrid", egClient);
  console.log("🥳eventGrid initialized");
});

// register something else...(e.g. telemetry etc)
(async () => {
  await startup();
})();
