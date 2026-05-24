/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { resolve } from "path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import __reqavitdg from "../../../../../deploy/util/envSetup.cjs";
const { getTargetEnv, getModuleName } = __reqavitdg;
import classDeployEnvironment from "./classDeployEnvironment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  await new classDeployEnvironment({
    envType,
    targetEnv,
    moduleName,
    logLevel,
    autoApprove,
  }).run();
})();
