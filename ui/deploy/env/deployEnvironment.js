import { getTargetEnv } from "../../../module/shared/func/deploy/util/envSetup.js";
import EnvironmentDeployer from "../../../module/shared/func/deploy/environmentDeployer.js";

(async () => {
  const autoApprove = process.argv.includes("--auto-approve");
  let logLevel, targetEnv, moduleName, envType;
  // logLevel = "DEBUG";
  try {
    envType = process.env.TF_VAR_env_type;
    targetEnv = getTargetEnv();
    moduleName = "ui";
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
  new EnvironmentDeployer({ envType, targetEnv, moduleName, logLevel, autoApprove }).run();
})();
