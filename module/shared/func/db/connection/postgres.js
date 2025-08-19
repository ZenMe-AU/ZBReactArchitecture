const { Sequelize } = require("sequelize");
const { DefaultAzureCredential } = require("@azure/identity");

async function createPostgresInstance(config) {
  let password;

  switch (config.authMode) {
    case "password":
      password = config.password;
      break;
    default:
    case "azure-ad":
      password = await getAzureAccessToken();
      break;
  }
  const sequelize = new Sequelize(config.database, config.username, password, config);
  return sequelize;
}

async function getAzureAccessToken() {
  const credential = new DefaultAzureCredential();
  const tokenObj = await credential.getToken("https://ossrdbms-aad.database.windows.net");
  return tokenObj.token;
}

module.exports = { createPostgresInstance };
