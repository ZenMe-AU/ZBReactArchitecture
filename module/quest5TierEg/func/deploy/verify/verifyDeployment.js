/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Test that the deployment succeeded and all dependencies are in place. This test will not change any data.
const { resolve } = require("path");
const { execSync } = require("child_process");
const { getTargetEnv, getModuleName } = require("../util/envSetup");
const { getFunctionAppName, getResourceGroupName } = require("../util/namingConvention");

const moduleDir = resolve(__dirname, "..", "..", "..");
const expectedFunctionList = [
  "CreateAnswer",
  "CreateQuestion",
  "GetAnswer",
  "GetAnswerList",
  "GetFollowUpEventList",
  "GetQuestion",
  "GetQuestionList",
  "GetQuestionShareEventList",
  "GetSharedQuestionList",
  "SendFollowUp",
  "ShareQuestion",
  "UpdateQuestion",
  "CreateAnswerQueue",
  "CreateQuestionQueue",
  "SendFollowUpQueue",
  "ShareQuestionQueue",
  "UpdateQuestionQueue",
  //   "defaultPage",
  //   "swagger",
  //   "swaggerJson",
  //   "swaggerPath",
];

// Main verification
(async () => {
  try {
    const envType = process.env.TF_VAR_env_type || "dev";
    const targetEnv = getTargetEnv();
    const moduleName = getModuleName(moduleDir);
    const functionAppName = getFunctionAppName(targetEnv, moduleName);
    const resourceGroupName = getResourceGroupName(envType, targetEnv);

    console.log("Start: Post-Deployment Verification (PDV)");
    // Step 1: Check if the function app is running
    console.log("PDV Step 1: Check if the function app is running.");
    const state = getFunctionAppState(functionAppName, resourceGroupName);
    if (state !== "Running") {
      throw new Error(`Function App ${functionAppName} is not running! Current state: ${state}`);
    }
    console.log(`Success: Function App ${functionAppName} is running.`);

    // Step 2: Check if the function app contains expected functions
    console.log("PDV Step 2: Check if the function app contains expected functions.");
    const list = new Set(getFunctionList(functionAppName, resourceGroupName));
    const missingFunctions = expectedFunctionList.filter((func) => !list.has(func));
    if (missingFunctions.length > 0) {
      throw new Error(`Missing functions in Function App: ${missingFunctions}`);
    } else {
      console.log(`Success: All expected functions are present.`);
    }

    console.log("End: All deployment checks passed!");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();

// Get Azure Function App state
function getFunctionAppState(functionAppName, resourceGroupName) {
  try {
    // Query the state of the function app
    const state = execSync(`az functionapp show --name ${functionAppName} --resource-group ${resourceGroupName} --query "properties.state" -o tsv`, {
      encoding: "utf8",
    }).trim();
    return state;
  } catch (error) {
    console.error("Error getting function app state:", error.message);
    throw error;
  }
}

// Query functions list in the Function App
function getFunctionList(functionAppName, resourceGroupName) {
  // Query the list of function names
  try {
    return JSON.parse(
      execSync(`az functionapp function list --name ${functionAppName} --resource-group ${resourceGroupName} --query "[].config.name" -o json`, {
        encoding: "utf8",
      })
    );
  } catch (error) {
    console.error("Error getting function list:", error.message);
    throw error;
  }
}
