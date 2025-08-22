const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { getSubscriptionId } = require("@zenmechat/shared/deploy/util/azureCli.js");
const EnvironmentDeployer = require("@zenmechat/shared/deploy/environmentDeployer.js");

const moduleDir = resolve(__dirname, "..", "..", "..");

(async () => {
  let logLevel, targetEnv, moduleName, subscriptionId;
  // logLevel = "DEBUG";
  try {
    targetEnv = getTargetEnv();
    moduleName = getModuleName(moduleDir);
    subscriptionId = getSubscriptionId();
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
  const autoApprove = process.argv.includes("--auto-approve");
  new EnvironmentDeployer({ targetEnv, moduleName, subscriptionId, logLevel, autoApprove }).run();
})();
