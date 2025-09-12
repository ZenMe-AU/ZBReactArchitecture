const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("../template/util/envSetup.js");
const { getDbAdminName, getPgHost, getServiceBusHost } = require("../template/util/namingConvention.js");
const fs = require("fs");

const moduleDir = resolve(__dirname, "..", "..", "..");
const localSettingTemplate = {
  IsEncrypted: false,
  Values: {
    AzureWebJobsStorage: "",
    FUNCTIONS_WORKER_RUNTIME: "node",
    FUNCTIONS_EXTENSION_VERSION: "~4",
  },
  Host: {
    LocalHttpPort: 7071,
    CORS: "*",
  },
};

// Custom settings for local development
const customSettings = {
  JWT_SECRET: "bb64c67554381aff324d26669540f591e02e3e993ce85c2d1ed2962e22411634",
  QUESTION_URL: "http://localhost:7071",
};

(async () => {
  const fileName = "local.settings.json";
  const path = resolve(moduleDir, "func", fileName);
  let targetEnv, moduleName, envType, json;
  try {
    envType = process.env.TF_VAR_env_type;
    targetEnv = getTargetEnv();
    moduleName = getModuleName(moduleDir);
    json = localSettingTemplate;

    if (fs.existsSync(path)) {
      json = JSON.parse(fs.readFileSync(path, "utf8"));
    }

    json.Values = {
      ...json.Values,
      ...customSettings,
      // APPLICATIONINSIGHTS_CONNECTION_STRING : "",
      ServiceBusConnection: getServiceBusHost(targetEnv),
      DB_USERNAME: getDbAdminName(envType),
      DB_DATABASE: moduleName,
      DB_HOST: getPgHost(targetEnv),
    };

    fs.writeFileSync(path, JSON.stringify(json, null, 2));
    console.log(`Environment variables initialized in ${fileName}`);
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
})();
