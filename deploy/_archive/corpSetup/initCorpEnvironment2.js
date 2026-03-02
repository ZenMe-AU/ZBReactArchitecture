/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

/* This script configures the corporate environment with the relevant permissions to allow automated deployments.
 */
import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
// import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { getResourceGroupName, getLogAnalyticsWorkspaceName, getAppConfigName } from "../util/namingConvention.cjs";
import { generateNewEnvName, getTargetEnv } from "../util/envSetup.cjs";
import { getSubscriptionId, getDefaultAzureLocation, isStorageAccountNameAvailable } from "../util/azureCli.cjs";
import { AzureCliCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";

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

let CENTRAL_ENV = null;
function getCentralEnvName() {
  if (CENTRAL_ENV) {
    return CENTRAL_ENV;
  }
  try {
    const envContent = readFileSync(resolve("corp.env"), "utf8");
    const match = envContent.match(/^CENTRAL_ENV=(.+)$/m);
    if (match && match[1].trim()) {
      // escape any dangerous characters  Allowed characters: letters, numbers, ., _, -, (, )
      let validCharsRegex = /[^a-zA-Z0-9._\-\(\)]/g;
      let CENTRAL_ENV = match[1].trim().replace(validCharsRegex, "");
      return CENTRAL_ENV;
    } else {
      throw new Error("CENTRAL_ENV not found in central.env file.");
    }
  } catch (error) {
    throw new Error(" central.env not found.");
  }
}

// get env setting
let ENV_SETTING_CACHE;
function getEnvSetting(name, value, defaultValue = null) {
  try {
    const envContent = readFileSync(resolve("corp.env"), "utf8");
    const match = envContent.match(/^CENTRAL_ENV=(.+)$/m);
    if (match && match[1].trim()) {
      // escape any dangerous characters  Allowed characters: letters, numbers, ., _, -, (, )
      let validCharsRegex = /[^a-zA-Z0-9._\-\(\)]/g;
      let CENTRAL_ENV = match[1].trim().replace(validCharsRegex, "");
      return CENTRAL_ENV;
    } else {
      throw new Error("CENTRAL_ENV not found in central.env file.");
    }
  } catch (error) {
    throw new Error(" central.env not found.");
  }
}

function main() {
  const autoApprove = process.argv.includes("--auto-approve");
  const envType = "root";
  const centralEnv = getCentralEnvName();
  process.env.TF_VAR_target_env = centralEnv;
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  process.env.TF_VAR_subscription_name = `${centralEnv}-subscription`;
  console.log(`Setting subscription_name to: ${process.env.TF_VAR_subscription_name}`);
  process.env.TF_VAR_dns_path = `${centralEnv}.com`; // get from corp.env
  console.log(`Setting dns_path to: ${process.env.TF_VAR_dns_path}`);
  process.env.TF_VAR_resource_group_name = getResourceGroupName(envType, centralEnv);
  console.log(`Setting resource_group_name to: ${process.env.TF_VAR_resource_group_name}`);
  process.env.TF_VAR_location = getAzureLocation();
  console.log(`Setting location to: ${process.env.TF_VAR_location}`);
  process.env.TF_VAR_log_analytics_workspace_name = getLogAnalyticsWorkspaceName(centralEnv);
  console.log(`Setting log_analytics_workspace_name to: ${process.env.TF_VAR_log_analytics_workspace_name}`);
  // activatePimPermissions();

  try {
    execSync(`terraform init`, { stdio: "inherit", shell: true });
    console.log("Terraform initialized successfully.");
    // execSync(`terraform plan`, { stdio: "inherit", shell: true });
    // Run terraform
    execSync(`terraform apply ${autoApprove ? " -auto-approve" : ""}`, { stdio: "inherit", shell: true });
  } catch (error) {
    console.error("Terraform command failed:", error);
    process.exit(1);
  }
}

main();

export default { main };
