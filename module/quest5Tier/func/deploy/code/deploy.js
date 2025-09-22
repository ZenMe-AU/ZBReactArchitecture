const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("../util/envSetup");
const { getResourceGroupName, getServiceBusName, getFunctionAppName, getStorageAccountName } = require("../util/namingConvention");
const { getSubscriptionId } = require("../util/azureCli");
const CodeDeployer = require("./CodeDeployer");

const moduleDir = resolve(__dirname, "..", "..", "..");

(async () => {
  let targetEnv, moduleName, subscriptionId, envType;
  try {
    envType = process.env.TF_VAR_env_type;
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

  const codeDeployer = new CodeDeployer({
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
  await codeDeployer.run();
})();
