/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const EnvironmentDeployer = require("@zenmechat/shared/deploy/environmentDeployer.js");

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
