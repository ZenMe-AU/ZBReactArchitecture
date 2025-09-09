const path = require("path");
const { register } = require("@zenmechat/shared/bootstrap/registry");
const container = require("@zenmechat/shared/bootstrap/container");

// register db
register("db", async () => {
  const { createDatabaseInstance } = require("@zenmechat/shared/db/connection");
  const DB_TYPE = require("@zenmechat/shared/enum/dbType");
  // const config = require("./db/config.json")["development"];
  const config = {
    username: "hugejunglefowl-question-func",
    database: "question",
    host: "hugejunglefowl-postgresqlserver.postgres.database.azure.com",
  };
  const sequelize = await createDatabaseInstance(DB_TYPE.POSTGRES, config);

  container.register("db", sequelize);
  console.log("🥳DB initialized");
});

// register something else...(e.g. telemetry etc)
