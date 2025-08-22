const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup");
const { getSubscriptionId } = require("@zenmechat/shared/deploy/util/azureCli");
const CodeDeployer = require("@zenmechat/shared/deploy//CodeDeployer");

function getResourceGroupName(targetEnv) {
  return `${targetEnv}-resources`;
}
function getStorageAccountName(targetEnv) {
  return `${targetEnv}pvtstor`;
}
function getFunctionAppName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-func`;
}
function getServiceBusName(targetEnv) {
  return `${targetEnv}-sbnamespace`;
}

const moduleDir = resolve(__dirname, "..", "..", "..");

(async () => {
  let targetEnv, moduleName, subscriptionId;
  try {
    targetEnv = getTargetEnv();
    moduleName = getModuleName(moduleDir);
    subscriptionId = getSubscriptionId();
  } catch (err) {
    console.error("Failed to initialize deployment variables:", err.message);
    process.exit(1);
  }
  const serviceBusName = getServiceBusName(targetEnv);
  const functionAppName = getFunctionAppName(targetEnv, moduleName);
  const resourceGroupName = getResourceGroupName(targetEnv);
  const storageAccountName = getStorageAccountName(targetEnv);

  const codeDeployer = new CodeDeployer({
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
