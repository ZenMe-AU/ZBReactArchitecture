/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import { DefaultAzureCredential } from "@azure/identity";

async function createPostgresInstance(config) {
  if (!config.port) config.port = 5432;
  if (!config.dialect) config.dialect = PostgresDialect;
  if (!config.pool)
    config.pool = {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    };

  let password = null;
  switch (config.authMode) {
    case "password":
      password = config.password;
      break;
    default:
    case "azure-ad":
      config.ssl = { require: true, rejectUnauthorized: false };
      if (!config.hooks) config.hooks = {};
      config.hooks.beforeConnect = async (config) => {
        config.password = await getAzureAccessToken();
      };
      break;
  }

  const { authMode, dialectOptions, username, ...sequelizeOptions } = config;
  const sequelizeConfig = { ...sequelizeOptions, password, user: username };

  if (config.uri) {
    sequelizeConfig.url = config.uri;
  }

  return new Sequelize(sequelizeConfig);
}

async function getAzureAccessToken() {
  const credential = new DefaultAzureCredential();
  const tokenObj = await credential.getToken("https://ossrdbms-aad.database.windows.net");
  return tokenObj.token;
}

export { createPostgresInstance };