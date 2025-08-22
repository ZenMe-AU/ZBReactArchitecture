import { getTargetEnv } from "../../../module/shared/func/deploy/util/envSetup.js";
import { getSubscriptionId } from "../../../module/shared/func/deploy/util/azureCli.js";
import EnvironmentDeployer from "../../../module/shared/func/deploy/environmentDeployer.js";

(async () => {
  const autoApprove = process.argv.includes("--auto-approve");
  let logLevel, targetEnv, moduleName, subscriptionId;
  // logLevel = "DEBUG";
  try {
    targetEnv = getTargetEnv();
    moduleName = "ui";
    subscriptionId = getSubscriptionId();
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
  new EnvironmentDeployer({ targetEnv, moduleName, subscriptionId, logLevel, autoApprove }).run();
})();
