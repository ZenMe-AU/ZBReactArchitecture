/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import DB_TYPE from "../../../enum/dbType.mjs";
import { createPostgresInstance } from "./postgres.mjs";

function createDatabaseInstance(type, config) {
  switch (type) {
    case DB_TYPE.POSTGRES:
      return createPostgresInstance(config);
    // case  DB_TYPE.REDIS:
    // return require("./redis").createRedisInstance(config);
    default:
      throw new Error(`Unregistered Database type: ${type}`);
  }
}

export { createDatabaseInstance };
