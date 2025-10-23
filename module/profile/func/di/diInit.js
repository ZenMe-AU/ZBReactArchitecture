const path = require("path");
const { register, startup } = require("./diRegistry");
const container = require("./diContainer");

// register db

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

  console.log(container.get("models"));
  console.log("🥳DB initialized");
});

// register something else...(e.g. telemetry etc)
(async () => {
  await startup();
})();
