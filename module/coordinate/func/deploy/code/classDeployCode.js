/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// classDeployCode.js
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
} = require("../../../../../deploy/util/azureCli.cjs");
const { npmInstall, npmPrune, zipDir } = require("./cli.js");
const {
  getIdentityName,
  getAppConfigName,
} = require("../../../../../deploy/util/namingConvention.cjs");
const { execSync } = require("child_process");

class classDeployCode {
  constructor({
    envType,
    targetEnv,
    moduleName,
    subscriptionId,
    functionAppName,
    resourceGroupName,
    storageAccountName,
    serviceBusName,
    moduleDir,
  }) {
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
    this.outputDir = "out";
    this.excludeList = [
      "dist/*",
      ".vscode/*",
      ".git/*",
      "local.settings.json",
      "local.settings.json.template",
      "deploy/*",
    ];
    this.appSettings = {
      // JWT_SECRET: getAppConfigValueByKeyLabel({ appConfigName: getAppConfigName(this.targetEnv), key: "jwtSecret", label: this.envType }),
      JWT_SECRET:
        "bb64c67554381aff324d26669540f591e02e3e993ce85c2d1ed2962e22411634",
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
      // TODO: discuss with jake
      // getAppConfigValueByKeyLabel({ appConfigName: getAppConfigName(this.targetEnv), key: "webEndpoint", label: this.envType }).replace(/\/+$/, ""),
    ];
  }

  // _storageScope() {
  //   return `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.Storage/storageAccounts/${this.storageAccountName}`;
  // }

  // _serviceBusScope() {
  //   return `/subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.ServiceBus/namespaces/${this.serviceBusName}`;
  // }

  async run() {
    console.log("Starting deployment.");
    console.log("Step 1: Settings Function App Environment.");
    console.log(
      `Setting environment variables for Function App ${this.functionAppName}.`,
    );
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
    console.log(`Assigning roles to Function App ${this.functionAppName}.`);
    const functionAppPrincipalId = getFunctionAppPrincipalId({
      functionAppName: this.functionAppName,
      resourceGroupName: this.resourceGroupName,
    });
    // Assign roles to the Function App
    this.roleAssignments.forEach(
      ({ assignee = functionAppPrincipalId, role, scope }) => {
        assignRole({ assignee, role, scope });
      },
    );
    if (this.queueNames.length > 0) {
      console.log(`Creating Service Bus Queues.`);
    }
    // Create Service Bus Queues if any
    this.queueNames.forEach((queueName) => {
      createServiceBusQueue({
        resourceGroupName: this.resourceGroupName,
        namespaceName: this.serviceBusName,
        queueName,
      });
    });
    // Set CORS settings
    if (this.allowedOrigins.length > 0) {
      console.log(`Setting CORS for Function App.`);
      setFunctionAppCors({
        functionAppName: this.functionAppName,
        resourceGroupName: this.resourceGroupName,
        allowedOrigins: this.allowedOrigins,
      });
    }
    console.log(`Step 2: Creating output via pnpm.`);
    const funcDir = resolve(this.moduleDir, "func");
    const outputDir = resolve(funcDir, this.outputDir);
    // delete outputDir if it exists
    if (fs.existsSync(outputDir)) {
      console.log(`Deleting existing output directory.`);
      fs.rmSync(outputDir, { recursive: true, force: true });
    }

    execSync(
      `pnpm deploy --filter ${this.moduleName} --prod ${outputDir} --config.node-linker=hoisted --config.symlink=false --config.package-import-method=copy`,
      { stdio: "inherit", cwd: funcDir },
    );

    console.log("Step 3: Creating dist directory.");
    const distFile = resolve(funcDir, this.distPath);
    // Ensure the directory exists
    fs.mkdirSync(path.dirname(distFile), { recursive: true });
    // Remove existing dist file if it exists
    if (fs.existsSync(distFile)) {
      console.log(`Deleting existing dist file.`);
      fs.unlinkSync(distFile);
    }
    console.log("Step 4: Zipping output directory.");
    await zipDir(distFile, outputDir, this.excludeList);

    if (fs.existsSync(outputDir)) {
      console.log(`Deleting output directory.`);
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    console.log("Step 5: Deploying zip file to Azure Function App.");
    deployFunctionAppZip(
      {
        src: this.distPath,
        functionAppName: this.functionAppName,
        resourceGroupName: this.resourceGroupName,
      },
      { cwd: funcDir },
    );

    console.log("Deployment finished!");
  }
}

module.exports = classDeployCode;
