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
} = require("./util/azureCli.js");
const { npmInstall, npmPrune, zipDir } = require("./util/cli.js");

class CodeDeployer {
  constructor({ targetEnv, moduleName, subscriptionId, functionAppName, resourceGroupName, storageAccountName, serviceBusName, moduleDir }) {
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
    };
    this.deleteAppSettings = ["AzureWebJobsStorage"];

    this.roleAssignments = [
      //   { role: "Storage Blob Data Contributor", scope: this._storageScope() },
      //   { role: "Storage Queue Data Contributor", scope: this._storageScope() },
      //   { role: "Storage Table Data Contributor", scope: this._storageScope() },
      //   { role: "Azure Service Bus Data Sender", scope: this._serviceBusScope() },
      //   { role: "Azure Service Bus Data Receiver", scope: this._serviceBusScope() },
    ];
  }

  _storageScope() {
    return `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.Storage/storageAccounts/${this.storageAccountName}`;
  }

  _serviceBusScope() {
    return `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ServiceBus/namespaces/${this.serviceBusName}`;
  }

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
