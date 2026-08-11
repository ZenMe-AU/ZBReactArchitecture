/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { Sequelize } = require("sequelize");
const { DefaultAzureCredential } = require("@azure/identity");

async function createPostgresInstance(config) {
  if (!config.port) config.port = 5432;
  if (!config.dialect) config.dialect = "postgres";
  if (!config.dialectOptions) config.dialectOptions = {};
  if (!config.pool)
    config.pool = {
      max: 10, // Maximum number of connections
      min: 0, // Minimum number of connections to keep
      acquire: 30000, // Maximum time (ms) to get a connection before throwing error
      idle: 10000, // Time (ms) a connection can be idle before being released
      evict: 1000, // How often (ms) to check for idle connections
    };

  let password = null;
  switch (config.authMode) {
    case "password":
      password = config.password;
      break;
    default:
    case "azure-ad":
      // password = await getAzureAccessToken();
      config.dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false, // suggested: in production, set to true
      };
      if (!config.hooks) config.hooks = {};
      config.hooks.beforeConnect = async (config) => {
        config.password = await getAzureAccessToken();
      };
      break;
  }

  let sequelize;
  if (config.uri) {
    sequelize = new Sequelize(config.uri, config);
  } else {
    sequelize = new Sequelize(config.database, config.username, password, config);
  }
  return sequelize;
}

async function getAzureAccessToken() {
  const credential = new DefaultAzureCredential();
  const tokenObj = await credential.getToken("https://ossrdbms-aad.database.windows.net");
  return tokenObj.token;
}

module.exports = { createPostgresInstance };
