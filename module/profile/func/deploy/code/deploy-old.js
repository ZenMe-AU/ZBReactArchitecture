// distPath = "dist/dist.zip"
// npm install
// zip -r ${distPath} .
// az functionapp deployment source config-zip --src "${distPath}" --name "${functionAppName}" --resource-group "${resourceGroupName}"

// deploy.js
const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { getSubscriptionId, getFunctionAppPrincipalId } = require("@zenmechat/shared/deploy/util/azureCli.js");
const { execSync } = require("child_process");
const fs = require("fs");
const { get } = require("http");

function getResourceGroupName(targetEnv) {
  return `${targetEnv}-resources`;
}
function getStorageAccountName(targetEnv) {
  return `${targetEnv}pvtstor`;
}
function getFunctionAppName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-func`;
}
function getServiceBusName(targetEnv) {
  return `${targetEnv}-sbnamespace`;
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

function main() {
  const serviceBusName = getServiceBusName(targetEnv);
  const functionAppPrincipalId = getFunctionAppPrincipalId({ functionAppName, resourceGroupName });
  const subscriptionId = getSubscriptionId();
  const storageAccountScope = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Storage/storageAccounts/${storageAccountName}`;
  const serviceBusScope = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ServiceBus/namespaces/${serviceBusName}`;

  execSync(
    `az functionapp config appsettings set -n ${functionAppName} -g ${resourceGroupName} --settings ServiceBusConnection__fullyQualifiedNamespace=${serviceBusName}.servicebus.windows.net`
  );
  execSync(`az functionapp config appsettings delete -n ${functionAppName} -g ${resourceGroupName} --setting-names AzureWebJobsStorage`);
  console.log(`Deleted AzureWebJobsStorage setting from ${functionAppName}`);
  execSync(`az role assignment create --assignee ${functionAppPrincipalId} --role "Storage Blob Data Contributor" --scope ${storageAccountScope}`);
  execSync(`az role assignment create --assignee ${functionAppPrincipalId} --role "Storage Queue Data Contributor" --scope ${storageAccountScope}`);
  execSync(`az role assignment create --assignee ${functionAppPrincipalId} --role "Storage Table Data Contributor" --scope ${storageAccountScope}`);
  console.log(`Assigned Storage Data Contributor role to ${functionAppPrincipalId} for storage account ${storageAccountName}`);

  execSync(`az role assignment create --assignee ${functionAppPrincipalId} --role "Azure Service Bus Data Sender" --scope ${serviceBusScope}`);
  execSync(`az role assignment create --assignee ${functionAppPrincipalId} --role "Azure Service Bus Data Receiver" --scope ${serviceBusScope}`);
  console.log(`Assigned Service Bus Data Sender and Receiver roles to ${functionAppPrincipalId} for service bus ${serviceBusName}`);

  console.log("🚀 Start deployment...");

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

  //   run(`az functionapp deployment source config-zip --src "${distPath}" --name "zenmelukefuncapp" --resource-group "zenmelukefuncapp"`, {
  //     cwd: resolve(moduleDir, "func"),
  //   });
  run(`az functionapp deployment source config-zip --src "${distPath}" --name ${functionAppName} --resource-group ${resourceGroupName}`, {
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

// az identity show -g stripedfrog-resources -n stripedfrog-mi

// az functionapp identity show -g stripedfrog-resources -n stripedfrog-questionV3-func
// {
//   "principalId": "5be5ded1-82b7-4efa-831d-c344cc790141",
//   "tenantId": "15fb0613-7977-4551-801b-6aadac824241",
//   "type": "SystemAssigned, UserAssigned",
//   "userAssignedIdentities": {
//     "/subscriptions/0930d9a7-2369-4a2d-a0b6-5805ef505868/resourcegroups/stripedfrog-resources/providers/Microsoft.ManagedIdentity/userAssignedIdentities/stripedfrog-mi": {
//       "clientId": "fe194b7e-e617-47c6-a7f4-1eb99fb2eca8",
//       "principalId": "76571094-39c8-4792-b25a-66015d40c459"
//     }
//   }
// }
