const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("../../../../shared/func/deploy/util/envSetup.js");
const EnvironmentDeployer = require("../../../../shared/func/deploy/environmentDeployer.js");

const moduleDir = resolve(__dirname, "..", "..", "..");

(async () => {
  let logLevel, targetEnv, moduleName, envType;
  // logLevel = "DEBUG";
  try {
    envType = process.env.TF_VAR_env_type;
    targetEnv = getTargetEnv();
    moduleName = getModuleName(moduleDir);
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
  const autoApprove = process.argv.includes("--auto-approve");
  new EnvironmentDeployer({ envType, targetEnv, moduleName, logLevel, autoApprove }).run();
})();
