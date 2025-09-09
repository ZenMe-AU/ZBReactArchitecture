const path = require("path");
const { register } = require("./shared/bootstrap/registry");
const container = require("./shared/bootstrap/container");

// register db
register("db", async () => {
  const { createDatabaseInstance } = require("./repository/model/connection");
  const DB_TYPE = require("./shared/enum/dbType");
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
