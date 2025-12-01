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
  getResourceGroupName,
  getServiceBusName,
  getFunctionAppName,
  getStorageAccountName,
} = require("../../../../../deploy/util/namingConvention.cjs");
const {
  getSubscriptionId,
} = require("../../../../../deploy/util/azureCli.cjs");
const classDeployCode = require("./classDeployCode.js");
const funcMetaData = require("../../funcMetaData.js");

const moduleDir = resolve(__dirname, "..", "..", "..");
const subscriptionList = funcMetaData.commands
  .map(
    ({
      subscriptionFilter: subscriptionFilter,
      eventQueueName,
      queueFuncName,
    }) => [
      { queueName: subscriptionFilter, funcName: queueFuncName },
      // { queueName: eventQueueName },
    ],
  )
  .flat();

(async () => {
  let targetEnv, moduleName, subscriptionId, envType;
  try {
    envType = process.env.TF_VAR_env_type || "dev";
    targetEnv = getTargetEnv();
    moduleName = getModuleName(moduleDir);
    subscriptionId = getSubscriptionId();
  } catch (err) {
    console.error("Failed to initialize deployment variables:", err.message);
    process.exit(1);
  }
  const serviceBusName = getServiceBusName(targetEnv);
  const functionAppName = getFunctionAppName(targetEnv, moduleName);
  const resourceGroupName = getResourceGroupName(envType, targetEnv);
  const storageAccountName = getStorageAccountName(targetEnv);

  const codeDeployer = new classDeployCode({
    envType,
    targetEnv,
    moduleName,
    subscriptionId,
    functionAppName,
    resourceGroupName,
    storageAccountName,
    serviceBusName,
    moduleDir,
  });
  codeDeployer.eventSubscriptionList = subscriptionList;
  codeDeployer.appSettings.EventQueueType = "eventGridTopic";
  await codeDeployer.run();
})();
