/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { resolve } from "path";
import { getTargetEnv, getModuleName } from "../../../../../deploy/util/envSetup.cjs";
import { getDbAdminName, getPgHost, getServiceBusHost, getAppInsightsName, getResourceGroupName } from "../../../../../deploy/util/namingConvention.cjs";
import { getAppInsightsConnectionString } from "../../../../../deploy/util/azureCli.cjs";
import { existsSync, readFileSync, writeFileSync } from "fs";

const moduleDir = resolve(__dirname, "..", "..", "..");
const localPort = 7074;
const frontendUrl = "http://localhost:5173";
const localSettingTemplate = {
  IsEncrypted: false,
  Values: {
    AzureWebJobsStorage: "UseDevelopmentStorage=true",
    FUNCTIONS_WORKER_RUNTIME: "node",
    FUNCTIONS_EXTENSION_VERSION: "~4",
  },
  Host: {
    LocalHttpPort: localPort,
    CORS: frontendUrl,
    CORSCredentials: true,
  },
};

// Custom settings for local development
const customSettings = {
  CLIENT_ID: "87aa3687-66a4-4fab-bf59-70de6bf768fa",
  TENANT_ID: "15fb0613-7977-4551-801b-6aadac824241",
  JWT_SECRET: "bb64c67554381aff324d26669540f591e02e3e993ce85c2d1ed2962e22411634",
  QUESTION_URL: `http://localhost:${localPort}`,
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

    if (existsSync(path)) {
      json = JSON.parse(readFileSync(path, "utf8"));
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
      // ServiceBusConnection: getServiceBusHost(targetEnv),
      DB_USERNAME: getDbAdminName(envType),
      DB_DATABASE: moduleName,
      DB_HOST: getPgHost(targetEnv),
      ...customSettings,
    };

    if (!isEnvSetUp) {
      json.Values.DB_USERNAME = "root";
      json.Values.DB_HOST = "localhost";
      json.Values.DB_PASSWORD = "DatabasePassword123!";
    }

    writeFileSync(path, JSON.stringify(json, null, 2));
    console.log(`Environment variables initialized in ${fileName}`);
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
})();
