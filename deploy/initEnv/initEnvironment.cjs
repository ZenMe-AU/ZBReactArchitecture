/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { execSync } = require("child_process");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const { resolve, dirname } = require("path");
const {
  getResourceGroupName,
  getStorageAccountName,
  getAppConfigName,
  getDbAdminName,
} = require("../util/namingConvention.cjs");
const { generateNewEnvName, getTargetEnv } = require("../util/envSetup.cjs");
const {
  getSubscriptionId,
  getDefaultAzureLocation,
  isStorageAccountNameAvailable,
} = require("../util/azureCli.cjs");
const minimist = require("minimist");
const currentDirname = __dirname;

let cachedSubscriptionId = null;
function getAzureSubscriptionId() {
  if (cachedSubscriptionId) {
    return cachedSubscriptionId;
  }
  try {
    return (cachedSubscriptionId = getSubscriptionId());
  } catch (error) {
    console.error(
      "Failed to get Azure subscription ID. Make sure you are logged in with Azure CLI.",
    );
    process.exit(1);
  }
}

let azureLocation = null;
function getAzureLocation() {
  if (azureLocation) {
    return azureLocation;
  }
  try {
    const tmpazureLocation = getDefaultAzureLocation();
    if (tmpazureLocation && tmpazureLocation.length > 0) {
      return (azureLocation = tmpazureLocation);
    }
  } catch (error) {
    console.error("Failed to get Azure location:", error.message);
  }
  azureLocation = "australiaeast"; // Default fallback location
  console.warn(`Using fallback Azure location: ${azureLocation}`);
  return azureLocation;
}

let TARGET_ENV = null;
function getTargetEnvName(targetDir = currentDirname) {
  if (TARGET_ENV) {
    return TARGET_ENV;
  }
  try {
    // Try to read existing TARGET_ENV from .env file
    TARGET_ENV = getTargetEnv(targetDir);
  } catch (error) {
    const newEnvName = generateNewEnvName();
    const isAvailable = isStorageAccountNameAvailable(newEnvName);
    const envFilePath = resolve(targetDir, ".env");
    console.log("envFilePath:", envFilePath);
    if (isAvailable) {
      TARGET_ENV = newEnvName;
      writeFileSync(envFilePath, `TARGET_ENV=${TARGET_ENV}\n`, { flag: "w" });
    } else {
      getTargetEnvName(targetDir);
    }
  }
  return TARGET_ENV;
}

/** Activate PIM role "App Configuration Data Owner" for the current user for the current tenant.
 * This activation will usually expire within 8 hours and need to be re-activated every time it's needed.
 */
function activatePimPermissions() {
  try {
    // Get current user id from Azure CLI
    const userId = execSync("az ad signed-in-user show --query id -o tsv", {
      encoding: "utf8",
    }).trim();
    console.log(
      `az role assignment create --assignee ${userId} --role "App Configuration Data Owner" --scope /subscriptions/${getAzureSubscriptionId()}`,
    );
    execSync(
      `az role assignment create --assignee ${userId} --role "App Configuration Data Owner" --scope /subscriptions/${getAzureSubscriptionId()}`,
    );
  } catch (error) {
    console.error("Failed to activate PIM role:", error);
    process.exit(1);
  }
}

function terraformApply(autoApprove = false, planfile = "") {
  const args = autoApprove ? "-auto-approve" : "";
  execSync(`terraform apply ${args} ${planfile}`, {
    stdio: "inherit",
    shell: true,
  });
}

function initEnvironment() {
  const autoApprove = process.argv.includes("--auto-approve");
  const args = minimist(process.argv.slice(2));
  const assignDeployer = args.assignDeployer; // The service principal to assign as contributor of the resource group
  const envDir = args.envDir;
  // set the environment variables for terraform
  const envType = process.env.TF_VAR_env_type; // environment type: dev/test/prod is prefixed to the environment name
  // get the environment name
  const targetEnv = getTargetEnvName(envDir);
  process.env.TF_VAR_target_env = targetEnv;
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  // use the pre-configured subscription
  const subscriptionId = getAzureSubscriptionId();
  process.env.TF_VAR_subscription_id = subscriptionId;
  console.log(
    `Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`,
  );
  // all resources in the environment will be created in the same azure hosting location
  process.env.TF_VAR_location = getAzureLocation();
  console.log(`Setting location to: ${process.env.TF_VAR_location}`);
  // the resource group name is also the environment name
  const resourceGroupName = getResourceGroupName(envType, targetEnv);
  process.env.TF_VAR_resource_group_name = resourceGroupName;
  console.log(
    `Setting resource_group_name to: ${process.env.TF_VAR_resource_group_name}`,
  );
  // set the storage account name
  process.env.TF_VAR_storage_account_name = getStorageAccountName(targetEnv);
  console.log(
    `Setting storage_account_name to: ${process.env.TF_VAR_storage_account_name}`,
  );
  //set the app config name
  const appConfigName = getAppConfigName(targetEnv);
  process.env.TF_VAR_appconfig_name = appConfigName;
  console.log(
    `Setting appconfig_name to: ${process.env.TF_VAR_appconfig_name}`,
  );
  // use the pre-defined DB Admin Group from entra id, as an administrator group for DB access in the resource group
  const dbAdminGroupName = getDbAdminName(envType);
  process.env.TF_VAR_db_admin_group_name = dbAdminGroupName;
  console.log(
    `Setting db_admin_group_name to: ${process.env.TF_VAR_db_admin_group_name}`,
  );

  activatePimPermissions(); // activate PIM role for current user to allow adding app configuration items

  try {
    execSync(`terraform init`, { stdio: "inherit", shell: true });
    console.log("Terraform initialized successfully.");

    terraformApply(autoApprove);

    // Assign roles (Contributor, App Configuration Data Owner) to deployer service principal if specified
    if (assignDeployer) {
      const spId = execSync(
        `az ad sp list --display-name "${assignDeployer}" --query "[0].id" -o tsv`,
        { encoding: "utf8" },
      ).trim();
      console.log(
        `az role assignment create --assignee ${spId} --role "App Configuration Data Owner" --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
      );
      execSync(
        `az role assignment create --assignee ${spId} --role "App Configuration Data Owner" --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
        { stdio: "inherit" },
      );

      console.log(
        `az role assignment create --assignee ${spId} --role "Contributor" --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
      );
      execSync(
        `az role assignment create --assignee ${spId} --role "Contributor" --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
        { stdio: "inherit" },
      );
    }
  } catch (error) {
    console.error("Terraform command failed:", error);
    process.exit(1);
  }
}

initEnvironment();

module.exports = { initEnvironment };
