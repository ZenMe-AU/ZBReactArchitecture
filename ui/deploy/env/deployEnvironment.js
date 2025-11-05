/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { getTargetEnv } from "../deploy/util/envSetup.js";
import EnvironmentDeployer from "./environmentDeployer.js";

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
