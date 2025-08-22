// distPath = "dist/dist.zip"
// npm install
// zip -r ${distPath} .
// az functionapp deployment source config-zip --src "${distPath}" --name "${functionAppName}" --resource-group "${resourceGroupName}"

// deploy.js
const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { execSync } = require("child_process");
const fs = require("fs");

function getResourceGroupName(targetEnv) {
  return `${targetEnv}-resources`;
}
function getStorageAccountName(targetEnv) {
  return `${targetEnv}pvtstor`;
}
function getFunctionAppName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-func`;
}
let cachedSubscriptionId = null;
function getAzureSubscriptionId() {
  if (cachedSubscriptionId) {
    return cachedSubscriptionId;
  }
  try {
    const output = execSync("az account show --query id -o tsv", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
    cachedSubscriptionId = output.trim();
    return cachedSubscriptionId;
  } catch (error) {
    console.error("Failed to get Azure subscription ID. Make sure you are logged in with Azure CLI.");
    process.exit(1);
  }
}

const moduleDir = resolve(__dirname, "..", "..", "..");
const targetEnv = getTargetEnv();
const moduleName = getModuleName(moduleDir);

const functionAppName = getFunctionAppName(targetEnv, moduleName);
const resourceGroupName = getResourceGroupName(targetEnv);
const storageAccountName = getStorageAccountName(targetEnv);
const containerName = `${functionAppName}-dist`;

const distPath = "dist/dist.zip";

const excludeList = ["dist/*", ".vscode/*", ".git/*", "local.settings.json", "local.settings.json.template", "deploy/*"];

function run(command, options = {}) {
  console.log(`▶️ Running: ${command}`);
  try {
    execSync(command, { stdio: "inherit", ...options });
  } catch (err) {
    console.error(`❌ Error executing: ${command}`);
    process.exit(1);
  }
}

/** Activate PIM role "Storage Blob Data Contributor" for the current user for the current tenant.
 * This activation will usually expire within 8 hours and need to be re-activated every time it's needed.
 */
function activatePimPermissions() {
  try {
    // Get current user id from Azure CLI
    const userId = execSync("az ad signed-in-user show --query id -o tsv", { encoding: "utf8" }).trim();
    // const scope = execSync(`az storage account show  --name ${storageAccountName} --resource-group ${resourceGroupName} --query id -o tsv`, {
    //   encoding: "utf8",
    // }).trim();
    // console.log(`az role assignment create --assignee ${userId} --role "Storage Blob Data Contributor" --scope ${scope}`);
    // execSync(`az role assignment create --assignee ${userId} --role "Storage Blob Data Contributor" --scope ${scope}`);
    console.log(
      `az role assignment create --assignee ${userId} --role "Storage Blob Data Contributor" --scope /subscriptions/${getAzureSubscriptionId()}`
    );
    execSync(
      `az role assignment create --assignee ${userId} --role "Storage Blob Data Contributor" --scope /subscriptions/${getAzureSubscriptionId()}`
    );
  } catch (error) {
    console.error("Failed to activate PIM role:", error);
    process.exit(1);
  }
}

function main() {
  /*console.log("🚀 Start deployment...");
  if (fs.existsSync("shared/package.json")) {
    console.log("📦 Installing shared module dependencies...");
    run("npm install", { cwd: resolve(moduleDir, "..", "shared", "func") });
  }

  //   run("npm install");
  run("npm install --omit=dev", { cwd: resolve(moduleDir, "func") });

  run("npm prune --production", { cwd: resolve(moduleDir, "func") });

  if (!fs.existsSync(resolve(moduleDir, "func", "dist"))) {
    fs.mkdirSync(resolve(moduleDir, "func", "dist"));
  }

  if (fs.existsSync(resolve(moduleDir, "func", distPath))) {
    fs.unlinkSync(resolve(moduleDir, "func", distPath));
  }

  const excludeArgs = excludeList.map((p) => `-x "${p}"`).join(" ");
  run(`zip -r ${distPath} . ${excludeArgs}`, { cwd: resolve(moduleDir, "func") });
*/
  //   run(`az functionapp deployment source config-zip --src "${distPath}" --name "zenmelukefuncapp" --resource-group "zenmelukefuncapp"`, {
  //     cwd: resolve(moduleDir, "func"),
  //   });
  //   activatePimPermissions();

  run(`az functionapp deployment source config-zip --src "${distPath}" --name "${functionAppName}" --resource-group "${resourceGroupName}"`, {
    cwd: resolve(moduleDir, "func"),
  });

  //   run(`az storage container create --name ${containerName} --account-name ${storageAccountName} --auth-mode login`, {
  //     cwd: resolve(moduleDir, "func"),
  //   });

  //     run(
  //       `az storage blob upload --container-name ${containerName} --file "${distPath}" --name dist.zip --account-name ${storageAccountName} --auth-mode login --overwrite`,
  //       { cwd: resolve(moduleDir, "func") }
  //     );
  //   const sasExpiry = "2030-01-01T00:00Z";
  //   const sasToken = execSync(
  //     `az storage blob generate-sas --account-name ${storageAccountName} --container-name ${containerName} --name dist.zip --permissions r --expiry ${sasExpiry} -o tsv`,
  //     { encoding: "utf-8" }
  //   ).trim();

  //   // Blob URL
  //   const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/dist.zip?${sasToken}`;

  //   run(`az functionapp deployment source config-zip --src "${blobUrl}" --name ${functionAppName} --resource-group ${resourceGroupName}`, {
  //     cwd: resolve(moduleDir, "func"),
  //   });

  console.log("✅ Deployment finished!");
}

main();

//   run(`az functionapp deployment source config-zip --src "${distPath}" --name "${functionAppName}" --resource-group "${resourceGroupName}"`, {
//     cwd: resolve(moduleDir, "func"),
//   });

// servicebus access + env settings
// storage account access
// az servicebus namespace show -n <SERVICE_BUS_NAME> -g <RESOURCE_GROUP> --query id -o tsv
// az storage account show -n <STORAGE_ACCOUNT> -g <RESOURCE_GROUP> --query id -o tsv
// az functionapp config appsettings delete -n <FUNCTION_APP> -g <RESOURCE_GROUP> --setting-names AzureWebJobsStorage__managedIdentityResourceId
// az functionapp config appsettings set -n <FUNCTION_APP> -g <RESOURCE_GROUP> \
//     --settings AzureWebJobsStorage__managedIdentityResourceId=<NEW_RESOURCE_ID></NEW_RESOURCE_ID>
