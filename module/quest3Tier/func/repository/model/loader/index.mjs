/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import DB_TYPE from "../../../enum/dbType.mjs";
import { loadModels } from "./sequelize.js";

function createModelsLoader(type, db, modelsDir) {
  switch (type) {
    case DB_TYPE.POSTGRES:
      return loadModels(db, modelsDir);
    // case  DB_TYPE.REDIS:
    // return;
    default:
      throw new Error(`Unknown Model Loader type: ${type}`);
  }
}

export { createModelsLoader };
