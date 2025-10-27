/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("../util/envSetup.js");
const {
  getDbAdminName,
  getPgHost,
  getServiceBusHost,
  getAppInsightsName,
  getResourceGroupName,
  getEventGridName,
} = require("../util/namingConvention.js");
const { getAppInsightsConnectionString, getEventGridTopicEndpoint } = require("../util/azureCli.js");
const fs = require("fs");

const moduleDir = resolve(__dirname, "..", "..", "..");
const localPort = 7076;
const localSettingTemplate = {
  _comment:
    "The local.settings.json file is loaded by Azure Functions Core Tools when you run your Azure Functions project locally (for example, using func start or the Functions Host task in VS Code). The settings under the Values section are set as environment variables for your local function app. This file is only used for local development and is not uploaded or used when you deploy your function app to Azure—you must configure equivalent settings in the Azure portal or your deployment pipeline.",
  IsEncrypted: false,
  Values: {
    AzureWebJobsStorage: "",
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
  JWT_SECRET: "bb64c67554381aff324d26669540f591e02e3e993ce85c2d1ed2962e22411634",
  BASE_URL: "http://localhost:" + localPort,
  ServiceBusConnection:
    "Endpoint=sb://localhost;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SAS_KEY_VALUE;UseDevelopmentEmulator=true;",
  ServiceBusConnection__fullyQualifiedNamespace: "localhost",
  EventQueueType: "eventEmitter",
  EventGridConnection__topicEndpointUri: "http://localhost:" + localPort,
  // EventGridConnection: "https://conceptualskink-eg.australiaeast-1.eventgrid.azure.net/api/events",
  // EventGridNameSpaceConnection__topicEndpointUri: "https://hugejunglefowl-egnamespace.australiaeast-1.eventgrid.azure.net",
  // EventGridNameSpaceConnection: "https://hugejunglefowl-egnamespace.australiaeast-1.eventgrid.azure.net",
  // set your local DB details
  DB_USERNAME: "root",
  DB_HOST: "localhost",
  DB_PASSWORD: "DatabasePassword123!",
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
      APPLICATIONINSIGHTS_CONNECTION_STRING: getAppInsightsConnectionString({
        appInsightsName: getAppInsightsName(targetEnv),
        resourceGroupName: getResourceGroupName(envType, targetEnv),
      }),
      ServiceBusConnection__fullyQualifiedNamespace: getServiceBusHost(targetEnv),
      EventGridConnection__topicEndpointUri: getEventGridTopicEndpoint({
        resourceGroupName: getResourceGroupName(envType, targetEnv),
        eventGridName: getEventGridName(targetEnv),
      }),
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
