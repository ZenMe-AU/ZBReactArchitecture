/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { resolve } = require("path");
const {
  getTargetEnv,
  getModuleName,
} = require("../../../../../deploy/util/envSetup.cjs");
const {
  getDbAdminName,
  getPgHost,
  getServiceBusHost,
  getAppInsightsName,
  getResourceGroupName,
} = require("../../../../../deploy/util/namingConvention.cjs");
const {
  getAppInsightsConnectionString,
} = require("../../../../../deploy/util/azureCli.cjs");
const fs = require("fs");

const moduleDir = resolve(__dirname, "..", "..", "..");
const localPort = 7072;
const localSettingTemplate = {
  IsEncrypted: false,
  Values: {
    AzureWebJobsStorage: "",
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
  JWT_SECRET:
    "bb64c67554381aff324d26669540f591e02e3e993ce85c2d1ed2962e22411634",
  BASE_URL: "http://localhost:" + localPort,
  // ServiceBusConnection:
  //   "Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;",
  // ServiceBusConnection__fullyQualifiedNamespace: "localhost",
  // set your local DB details
  // DB_USERNAME: "root",
  // DB_HOST: "localhost",
  // DB_PASSWORD: "DatabasePassword123!",
};

(async () => {
  const fileName = "local.settings.json";
  const path = resolve(moduleDir, "func", fileName);
  let targetEnv, moduleName, envType, json;
  try {
    envType = process.env.TF_VAR_env_type || "dev";
    targetEnv = getTargetEnv();
    moduleName = getModuleName(moduleDir);
    json = localSettingTemplate;

    if (fs.existsSync(path)) {
      json = JSON.parse(fs.readFileSync(path, "utf8"));
    }

    json.Values = {
      ...json.Values,
      APPLICATIONINSIGHTS_CONNECTION_STRING:
        getAppInsightsConnectionString({
          appInsightsName: getAppInsightsName(targetEnv),
          resourceGroupName: getResourceGroupName(envType, targetEnv),
        }) ?? "",
      ServiceBusConnection__fullyQualifiedNamespace:
        getServiceBusHost(targetEnv),
      DB_USERNAME: getDbAdminName(envType),
      DB_DATABASE: moduleName,
      DB_HOST: getPgHost(targetEnv),
      ...customSettings,
    };

    fs.writeFileSync(path, JSON.stringify(json, null, 2));
    console.log(`Environment variables initialized in ${fileName}`);
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
})();
