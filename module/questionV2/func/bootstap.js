const path = require("path");
const { createDatabaseInstance } = require("@zenmechat/shared/db/connection");
const { createModelsLoader } = require("@zenmechat/shared/db/loader");
const container = require("@zenmechat/shared/db/container");
const DB_TYPE = require("@zenmechat/shared/enum/dbType");
const env = process.env.NODE_ENV || "development";
const config = require("./db/config.json")[env];

(async () => {
  const sequelize = createDatabaseInstance(DB_TYPE.POSTGRES, config);
  const models = createModelsLoader(DB_TYPE.POSTGRES, sequelize, path.join(__dirname, "db", "model"));

  container.register("db", sequelize);
  container.register("models", models);

  console.log(container.get("models"));
})();
