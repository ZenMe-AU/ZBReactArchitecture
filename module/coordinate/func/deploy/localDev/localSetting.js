/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("../../../../../deploy/util/envSetup.cjs");
const {
  getDbAdminName,
  getPgHost,
  getServiceBusHost,
  getAppInsightsName,
  getResourceGroupName,
  getEventGridName,
} = require("../../../../../deploy/util/namingConvention.cjs");
const { getAppInsightsConnectionString, getEventGridTopicEndpoint } = require("../../../../../deploy/util/azureCli.cjs");
const fs = require("fs");

const moduleDir = resolve(__dirname, "..", "..", "..");
const localPort = 7073;
const localDbPort = "55432";
const defaultDbPort = "5432";
const localSettingTemplate = {
  _comment:
    "The local.settings.json file is loaded by Azure Functions Core Tools when you run your Azure Functions project locally (for example, using func start or the Functions Host task in VS Code). The settings under the Values section are set as environment variables for your local function app. This file is only used for local development and is not uploaded or used when you deploy your function app to Azure—you must configure equivalent settings in the Azure portal or your deployment pipeline.",
  IsEncrypted: false,
  Values: {
    AzureWebJobsStorage: "UseDevelopmentStorage=true",
    AzureWebJobsSecretStorageType: "Files",
    FUNCTIONS_WORKER_RUNTIME: "node",
    FUNCTIONS_EXTENSION_VERSION: "~4",
  },
  Host: {
    LocalHttpPort: localPort,
    CORS: "*",
  },
};

// Custom settings for local development
const customSettings = {
  CLIENT_ID: "87aa3687-66a4-4fab-bf59-70de6bf768fa",
  TENANT_ID: "15fb0613-7977-4551-801b-6aadac824241",
  JWT_SECRET: "bb64c67554381aff324d26669540f591e02e3e993ce85c2d1ed2962e22411634",
  BASE_URL: "http://localhost:" + localPort,
  // set your local DB details
  // DB_USERNAME: "root",
  // DB_HOST: "localhost",
  // DB_PASSWORD: "DatabasePassword123!",
};

(async () => {
  const fileName = "local.settings.json";
  const path = resolve(moduleDir, "func", fileName);
  let targetEnv,
    moduleName,
    envType,
    json,
    isEnvSetUp = true;
  try {
    envType = process.env.TF_VAR_env_type || "dev";
    targetEnv = (() => {
      try {
        return getTargetEnv();
      } catch (err) {
        isEnvSetUp = false;
        console.warn("[WARNING] Failed to determine target environment, defaulting to 'localDev':", err.message);
        return "localDev";
      }
    })();
    moduleName = getModuleName(moduleDir);
    json = localSettingTemplate;

    if (fs.existsSync(path)) {
      json = JSON.parse(fs.readFileSync(path, "utf8"));
    }

    json.Values = {
      ...json.Values,
      APPLICATIONINSIGHTS_CONNECTION_STRING: (() => {
        try {
          return getAppInsightsConnectionString({
            appInsightsName: getAppInsightsName(targetEnv),
            resourceGroupName: getResourceGroupName(envType, targetEnv),
          });
        } catch (err) {
          console.warn(err.message);
          return "InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=https://westus-0.in.applicationinsights.azure.com/";
        }
      })(),
      DB_USERNAME: getDbAdminName(envType),
      DB_DATABASE: moduleName,
      DB_HOST: getPgHost(targetEnv),
      DB_PORT: targetEnv === "localDev" ? localDbPort : defaultDbPort,
      ...customSettings,
    };

    if (!isEnvSetUp) {
      json.Values.DB_USERNAME = "root";
      json.Values.DB_HOST = "localhost";
      json.Values.DB_PORT = localDbPort;
      json.Values.DB_PASSWORD = "DatabasePassword123!";
    }

    fs.writeFileSync(path, JSON.stringify(json, null, 2));
    console.log(`Environment variables initialized in ${fileName}`);
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
})();
