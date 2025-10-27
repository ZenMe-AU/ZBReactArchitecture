/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

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
  createEventGridTopic,
  getEventGridTopicEndpoint,
  getEventGridSubscriptionList,
} = require("../util/azureCli.js");
const { npmInstall, npmPrune, zipDir } = require("./cli.js");
const { getIdentityName, getAppConfigName, getEventGridName } = require("../util/namingConvention.js");
const { execSync } = require("child_process");

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
    this.eventGridName = getEventGridName(targetEnv);
    this.moduleDir = moduleDir;

    this.distPath = "dist/dist.zip";
    this.excludeList = ["dist/*", ".vscode/*", ".git/*", "local.settings.json", "local.settings.json.template", "deploy/*"];
    this.appSettings = {
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
      // getAppConfigValueByKeyLabel({ appConfigName: getAppConfigName(this.targetEnv), key: "webEndpoint", label: this.envType }).replace(/\/+$/, ""),
    ];
    this.topicNames = [];
    this.eventSubscriptionList = [];
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
    // Assign roles to the Function App
    this.roleAssignments?.forEach(({ assignee = functionAppPrincipalId, role, scope }) => {
      assignRole({ assignee, role, scope });
    });
    if (this.queueNames.length > 0) {
      console.log(`Creating Service Bus Queues...`);

      // Create Service Bus Queues if any
      this.queueNames?.forEach((queueName) => {
        createServiceBusQueue({ resourceGroupName: this.resourceGroupName, namespaceName: this.serviceBusName, queueName });
      });
    }
    // // Create topic and subscription if any
    // if (this.topicNames?.length > 0 || this.eventSubscriptionList?.length > 0) {
    //   this.appSettings = {
    //     ...this.appSettings,
    //     EventGridConnection__topicEndpointUri: getEventGridTopicEndpoint({
    //       resourceGroupName: this.resourceGroupName,
    //       eventGridName: this.eventGridName,
    //     }),
    //     EventGridConnection__credential: "managedidentity",
    //     EventGridConnection__clientId: getIdentityClientId({
    //       identityName: getIdentityName(this.targetEnv),
    //       resourceGroupName: this.resourceGroupName,
    //     }),
    //   };
    //   // // Get Event Grid Namespace Topic List
    //   // console.log(`Creating Event Grid Topics...`);
    //   // const existingTopics = getEventGridTopicList({
    //   //   resourceGroupName: this.resourceGroupName,
    //   //   eventGridNamespaceName: this.eventGridName,
    //   // });
    //   // const existingTopicArray = JSON.parse(existingTopics ?? "[]");
    //   // // Create Event Grid Topics if any
    //   // await Promise.all(
    //   //   this.topicNames
    //   //     .filter((t) => !existingTopicArray.includes(t))
    //   //     .map((topicName) => {
    //   //       try {
    //   //         createEventGridTopic({
    //   //           resourceGroupName: this.resourceGroupName,
    //   //           eventGridNamespaceName: this.eventGridName,
    //   //           topicName,
    //   //         });
    //   //       } catch (err) {
    //   //         console.error(`Failed to create topic ${topicName}:`, err.message);
    //   //       }
    //   //     })
    //   // );
    // }
    // // Settings Env Var for the Function App
    // setFunctionAppSetting({
    //   functionAppName: this.functionAppName,
    //   resourceGroupName: this.resourceGroupName,
    //   appSettings: this.appSettings,
    // });
    // deleteFunctionAppSetting({
    //   functionAppName: this.functionAppName,
    //   resourceGroupName: this.resourceGroupName,
    //   appSettingKeys: this.deleteAppSettings,
    // });
    // // Set CORS settings
    // if (this.allowedOrigins.length > 0) {
    //   console.log(`Setting CORS for Function App...`);
    //   setFunctionAppCors({
    //     functionAppName: this.functionAppName,
    //     resourceGroupName: this.resourceGroupName,
    //     allowedOrigins: this.allowedOrigins,
    //   });
    // }
    // console.log(`dependencies installing...`);
    // // Install shared module dependencies if it exists
    // if (fs.existsSync(resolve(this.moduleDir, "..", "shared", "func", "package.json"))) {
    //   npmInstall(resolve(this.moduleDir, "..", "shared", "func"));
    // }
    // // Install function app dependencies
    // npmInstall(funcDir, "--omit=dev");
    // npmPrune(funcDir);

    // console.log("Creating dist directory...");
    // const distFile = resolve(funcDir, this.distPath);
    // // Ensure the directory exists
    // fs.mkdirSync(path.dirname(distFile), { recursive: true });
    // // Remove existing dist file if it exists
    // if (fs.existsSync(distFile)) {
    //   fs.unlinkSync(distFile);
    // }

    // zipDir(this.distPath, funcDir, this.excludeList);

    // console.log("deploying zip file to Azure Function App...");
    // deployFunctionAppZip(
    //   {
    //     src: this.distPath,
    //     functionAppName: this.functionAppName,
    //     resourceGroupName: this.resourceGroupName,
    //   },
    //   { cwd: funcDir }
    // );
    if (this.eventSubscriptionList?.length > 0) {
      const existingSubscriptions = getEventGridSubscriptionList({
        resourceGroupName: this.resourceGroupName,
        eventGridName: this.eventGridName,
      });
      const existingSubscriptionArray = JSON.parse(existingSubscriptions ?? "[]");

      // Create Event Grid Subscriptions if any
      this.eventSubscriptionList
        .filter(({ queueName }) => !existingSubscriptionArray.includes(queueName))
        .forEach(({ queueName, funcName }) => {
          try {
            execSync(
              `az eventgrid topic event-subscription create \
                -n ${queueName} \
                -g ${this.resourceGroupName} \
                --topic-name ${this.eventGridName} \
                --endpoint /subscriptions/${this.subscriptionId}/resourceGroups/${this.resourceGroupName}/providers/Microsoft.Web/sites/${this.functionAppName}/functions/${funcName} \
                --endpoint-type azurefunction \
                --included-event-types ${queueName}
              `,
              {
                stdio: "inherit",
              }
            );
          } catch (error) {
            throw new Error("Could not create Event Grid Topic." + error.message);
          }
        });
    }
    console.log("Deployment finished!");
  }
}

module.exports = CodeDeployer;
