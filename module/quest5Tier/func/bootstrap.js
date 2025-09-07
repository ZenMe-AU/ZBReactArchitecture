const path = require("path");
const { register } = require("@zenmechat/shared/bootstrap/registry");
const container = require("@zenmechat/shared/bootstrap/container");

// register db
register("db", async () => {
  const { createDatabaseInstance } = require("@zenmechat/shared/db/connection");
  const { createModelsLoader } = require("@zenmechat/shared/db/loader");
  const DB_TYPE = require("@zenmechat/shared/enum/dbType");

  const modelDir = path.join(__dirname, "db", "model");
  const config = {
    authMode: "azure-ad",
    username: "hugejunglefowl-quest5Tier-func",
    database: "quest5Tier",
    host: "hugejunglefowl-postgresqlserver.postgres.database.azure.com",
    port: 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: true,
    },
  };
  config.username = "DbAdmin-Dev";

  const sequelize = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
  const models = createModelsLoader(DB_TYPE.POSTGRES, sequelize, modelDir);

  container.register("db", sequelize);
  container.register("models", models);

  console.log(container.get("models"));
  console.log("🥳DB initialized");
});

// register something else...(e.g. telemetry etc)
