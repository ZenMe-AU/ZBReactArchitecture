/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const DB_TYPE = require("../../enum/dbType");

function createModelsLoader(type, db, modelsDir) {
  switch (type) {
    case DB_TYPE.POSTGRES:
      return require("./sequelize").loadModels(db, modelsDir);
    // case  DB_TYPE.REDIS:
    // return;
    default:
      throw new Error(`Unknown Model Loader type: ${type}`);
  }
}

module.exports = { createModelsLoader };
