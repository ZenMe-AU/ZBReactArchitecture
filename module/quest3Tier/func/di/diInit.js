const path = require("path");
const { register } = require("./diRegistry");
const container = require("./diContainer");

// register db
register("db", async () => {
  const { createDatabaseInstance } = require("../repository/model/connection");
  const DB_TYPE = require("../enum/dbType");
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
