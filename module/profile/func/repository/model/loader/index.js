/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import DB_TYPE from "../../../enum/dbType.js";
import sequelizeLoader from "./sequelize.js";
const { loadModels } = sequelizeLoader;

async function createModelsLoader(type, db, modelsDir) {
  switch (type) {
    case DB_TYPE.POSTGRES:
      return loadModels(db, modelsDir);
    // case  DB_TYPE.REDIS:
    // return;
    default:
      throw new Error(`Unknown Model Loader type: ${type}`);
  }
}

export default { createModelsLoader };
