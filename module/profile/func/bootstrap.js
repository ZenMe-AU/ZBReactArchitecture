const path = require("path");
const { register } = require("@zenmechat/shared/bootstrap/registry");
const container = require("@zenmechat/shared/bootstrap/container");

// register db
register("db", async () => {
  const { createDatabaseInstance } = require("@zenmechat/shared/db/connection");
  const { createModelsLoader } = require("@zenmechat/shared/db/loader");
  const DB_TYPE = require("@zenmechat/shared/enum/dbType");

  const modelDir = path.join(__dirname, "db", "model");
  const config = require("./db/config.json")["development"];
  // const env = process.env.NODE_ENV || "development";
  // const config = require("./config.json")[env];
  // const { getFunctionAppName } = require("@zenmechat/shared/deploy/util/namingConvention");
  config.host = "hugejunglefowl-postgresqlserver.postgres.database.azure.com";
  config.username = "hugejunglefowl-profile-func";

  const sequelize = await createDatabaseInstance(DB_TYPE.POSTGRES, config);
  const models = createModelsLoader(DB_TYPE.POSTGRES, sequelize, modelDir);

  container.register("db", sequelize);
  container.register("models", models);

  console.log(container.get("models"));
  console.log("🥳DB initialized");
});

// register something else...(e.g. telemetry etc)
