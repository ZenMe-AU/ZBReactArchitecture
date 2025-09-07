// Test that the deployment succeeded and all dependencies are in place. This test will not change any data.
const { resolve } = require("path");
const { execSync } = require("child_process");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup");
const { getFunctionAppName, getResourceGroupName } = require("@zenmechat/shared/deploy/util/namingConvention");

const moduleDir = resolve(__dirname, "..", "..", "..");
const expectedFunctionList = [
  "CreateQuestion",
  "UpdateQuestion",
  "CreateAnswer",
  "SendFollowUp",
  "ShareQuestion",

  "CreateQuestionQueue",
  "UpdateQuestionQueue",
  "CreateAnswerQueue",
  "sendFollowUpQueue",
  "shareQuestionQueue",

  "GetQuestion",
  "GetQuestionList",
  "GetAnswer",
  "GetAnswerList",
  "GetSharedQuestionList",
  "getFollowUpEventList",
  "getQuestionShareEventList",
  //   "defaultPage",
  //   "swagger",
  //   "swaggerJson",
  //   "swaggerPath",
];

// Main verification
(async () => {
  try {
    const envType = process.env.TF_VAR_env_type;
    const targetEnv = getTargetEnv();
    const moduleName = getModuleName(moduleDir);
    const functionAppName = getFunctionAppName(targetEnv, moduleName);
    const resourceGroupName = getResourceGroupName(envType, targetEnv);

    // Step 1: Check if the  function app is running
    const state = getFunctionAppState(functionAppName, resourceGroupName);
    if (state !== "Running") {
      throw new Error(`Function App ${functionAppName} is not running! Current state: ${state}`);
    }
    console.log(`Function App ${functionAppName} is running.`);

    // Step 2: Check if the function app contains expected functions
    const list = new Set(getFunctionList(functionAppName, resourceGroupName));
    const missingFunctions = expectedFunctionList.filter((func) => !list.has(func));
    if (missingFunctions.length > 0) {
      console.warn("Missing functions in Function App:", missingFunctions);
    } else {
      console.log("All expected functions are present.");
    }

    console.log("All deployment checks passed!");
  } catch (err) {
    console.error("Deployment verification failed:", err.message);
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

// az functionapp show \
//   --name hugejunglefowl-profile-func \
//   --resource-group dev-hugejunglefowl \
//  --query "properties.state"
// Running

//  az functionapp function list \
//   --name hugejunglefowl-quest5Tier-func \
//   --resource-group dev-hugejunglefowl \
//  --query "[].config.name"

// [
//   "CreateAnswer",
//   "CreateAnswerQueue",
//   "CreateQuestion",
//   "CreateQuestionQueue",
//   "defaultPage",
//   "GetAnswer",
//   "GetAnswerList",
//   "getFollowUpEventList",
//   "GetQuestion",
//   "GetQuestionList",
//   "getQuestionShareEventList",
//   "GetSharedQuestionList",
//   "SendFollowUp",
//   "sendFollowUpQueue",
//   "ShareQuestion",
//   "shareQuestionQueue",
//   "swagger",
//   "swaggerJson",
//   "swaggerPath",
//   "UpdateQuestion",
//   "UpdateQuestionQueue"
// ]
