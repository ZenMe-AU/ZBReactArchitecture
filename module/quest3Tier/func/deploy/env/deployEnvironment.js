const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("../util/envSetup.js");
const classDeployEnvironment = require("./classDeployEnvironment.js");

const moduleDir = resolve(__dirname, "..", "..", "..");

(async () => {
  let logLevel, targetEnv, moduleName, envType;
  // logLevel = "DEBUG";
  try {
    envType = process.env.TF_VAR_env_type || "dev";
    targetEnv = getTargetEnv();
    moduleName = getModuleName(moduleDir);
  } catch (err) {
    console.error("Failed to initialize environment variables:", err.message);
    process.exit(1);
  }
  const autoApprove = process.argv.includes("--auto-approve");
  new classDeployEnvironment({ envType, targetEnv, moduleName, logLevel, autoApprove }).run();
})();
