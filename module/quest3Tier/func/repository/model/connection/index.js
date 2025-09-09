const DB_TYPE = require("../../../shared/enum/dbType");

function createDatabaseInstance(type, config) {
  switch (type) {
    case DB_TYPE.POSTGRES:
      return require("./postgres").createPostgresInstance(config);
    // case  DB_TYPE.REDIS:
    // return require("./redis").createRedisInstance(config);
    default:
      throw new Error(`Unregistered Database type: ${type}`);
  }
}

module.exports = { createDatabaseInstance };
