// CodeDeployer.js
const path = require("path");
const { resolve } = path;
const fs = require("fs");
const {
  getFunctionAppPrincipalId,
  setFunctionAppSetting,
  deleteFunctionAppSetting,
  assignRole,
  deployFunctionAppZip,
  createServiceBusQueue,
  getIdentityClientId,
  getAppConfigValueByKeyLabel,
  setFunctionAppCors,
} = require("./util/azureCli.js");
const { npmInstall, npmPrune, zipDir } = require("./util/cli.js");
const { getIdentityName, getAppConfigName } = require("./util/namingConvention");

class CodeDeployer {
  constructor({ envType, targetEnv, moduleName, subscriptionId, functionAppName, resourceGroupName, storageAccountName, serviceBusName, moduleDir }) {
    this.envType = envType;
    this.targetEnv = targetEnv;
    this.moduleName = moduleName;
    this.subscriptionId = subscriptionId;
    this.functionAppName = functionAppName;
    this.resourceGroupName = resourceGroupName;
    this.storageAccountName = storageAccountName;
    this.serviceBusName = serviceBusName;
    this.moduleDir = moduleDir;

    this.distPath = "dist/dist.zip";
    this.excludeList = ["dist/*", ".vscode/*", ".git/*", "local.settings.json", "local.settings.json.template", "deploy/*"];
    this.appSettings = {
      ServiceBusConnection__fullyQualifiedNamespace: `${this.serviceBusName}.servicebus.windows.net`,
      ServiceBusConnection__credential: "managedidentity",
      ServiceBusConnection__clientId: getIdentityClientId({
        identityName: getIdentityName(this.targetEnv),
        resourceGroupName: this.resourceGroupName,
      }),
      // JWT_SECRET: getAppConfigValueByKeyLabel({ appConfigName: getAppConfigName(this.targetEnv), key: "jwtSecret", label: this.envType }),
      JWT_SECRET: "bb64c67554381aff324d26669540f591e02e3e993ce85c2d1ed2962e22411634",
    };
    this.deleteAppSettings = ["AzureWebJobsStorage"];

    this.roleAssignments = [
      //   { role: "Storage Blob Data Contributor", scope: this._storageScope() },
      //   { role: "Storage Queue Data Contributor", scope: this._storageScope() },
      //   { role: "Storage Table Data Contributor", scope: this._storageScope() },
      //   { role: "Azure Service Bus Data Sender", scope: this._serviceBusScope() },
      //   { role: "Azure Service Bus Data Receiver", scope: this._serviceBusScope() },
    ];
    this.queueNames = [];
    this.allowedOrigins = [
      getAppConfigValueByKeyLabel({ appConfigName: getAppConfigName(this.targetEnv), key: "webEndpoint", label: this.envType }).replace(/\/+$/, ""),
    ];
  }

  // _storageScope() {
  //   return `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.Storage/storageAccounts/${this.storageAccountName}`;
  // }

  // _serviceBusScope() {
  //   return `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ServiceBus/namespaces/${this.serviceBusName}`;
  // }

  async run() {
    console.log("Starting deployment...");
    console.log("env settings...");
    const funcDir = resolve(this.moduleDir, "func");
    const functionAppPrincipalId = getFunctionAppPrincipalId({
      functionAppName: this.functionAppName,
      resourceGroupName: this.resourceGroupName,
    });
    // Settings Env Var for the Function App
    setFunctionAppSetting({
      functionAppName: this.functionAppName,
      resourceGroupName: this.resourceGroupName,
      appSettings: this.appSettings,
    });
    deleteFunctionAppSetting({
      functionAppName: this.functionAppName,
      resourceGroupName: this.resourceGroupName,
      appSettingKeys: this.deleteAppSettings,
    });
    // Assign roles to the Function App
    this.roleAssignments.forEach(({ assignee = functionAppPrincipalId, role, scope }) => {
      assignRole({ assignee, role, scope });
    });
    if (this.queueNames.length > 0) {
      console.log(`Creating Service Bus Queues...`);
    }
    // Create Service Bus Queues if any
    this.queueNames.forEach((queueName) => {
      createServiceBusQueue({ resourceGroupName: this.resourceGroupName, namespaceName: this.serviceBusName, queueName });
    });
    // Set CORS settings
    if (this.allowedOrigins.length > 0) {
      console.log(`Setting CORS for Function App...`);
      setFunctionAppCors({
        functionAppName: this.functionAppName,
        resourceGroupName: this.resourceGroupName,
        allowedOrigins: this.allowedOrigins,
      });
    }
    console.log(`dependencies installing...`);
    // Install shared module dependencies if it exists
    if (fs.existsSync(resolve(this.moduleDir, "..", "shared", "func", "package.json"))) {
      npmInstall(resolve(this.moduleDir, "..", "shared", "func"));
    }
    // Install function app dependencies
    npmInstall(funcDir, "--omit=dev");
    npmPrune(funcDir);

    console.log("Creating dist directory...");
    const distFile = resolve(funcDir, this.distPath);
    // Ensure the directory exists
    fs.mkdirSync(path.dirname(distFile), { recursive: true });
    // Remove existing dist file if it exists
    if (fs.existsSync(distFile)) {
      fs.unlinkSync(distFile);
    }

    zipDir(this.distPath, funcDir, this.excludeList);

    console.log("deploying zip file to Azure Function App...");
    deployFunctionAppZip(
      {
        src: this.distPath,
        functionAppName: this.functionAppName,
        resourceGroupName: this.resourceGroupName,
      },
      { cwd: funcDir }
    );

    console.log("Deployment finished!");
  }
}

module.exports = CodeDeployer;
