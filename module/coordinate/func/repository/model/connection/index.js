/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const DB_TYPE = require("../../../enum/dbType");

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
