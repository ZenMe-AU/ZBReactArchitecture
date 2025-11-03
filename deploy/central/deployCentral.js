/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cachedSubscriptionId = null;
function getAzureSubscriptionId() {
  if (cachedSubscriptionId) {
    return cachedSubscriptionId;
  }
  try {
    const output = execSync("az account show --query id -o tsv", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    cachedSubscriptionId = output.trim();
    return cachedSubscriptionId;
  } catch (error) {
    console.error(
      "Failed to get Azure subscription ID. Make sure you are logged in with Azure CLI."
    );
    process.exit(1);
  }
}

let TARGET_ENV;
function getTargetEnvName() {
  if (TARGET_ENV) {
    return TARGET_ENV;
  }
  try {
    const envFilePath = resolve(__dirname, "..", ".env");
    if (existsSync(envFilePath)) {
      const envContent = readFileSync(envFilePath, "utf8");
      const match = envContent.match(/^TARGET_ENV=(.+)$/m);
      if (match && match[1]) {
        TARGET_ENV = match[1].trim();
        console.log(`Loaded TARGET_ENV from .env: ${TARGET_ENV}`);
        return TARGET_ENV;
      }
    }
    console.error("TARGET_ENV not found in ../.env. Exiting.");
  } catch (error) {
    console.error("Error reading ../.env:", error);
  }
  process.exit(1);
}

let centralEnv;
function getCentralEnvName() {
  if (centralEnv) {
    return centralEnv;
  }
  // First, check if the environment variable is set
  centralEnv = process.env.TF_VAR_parent_domain_name; // Prioritize existing env var
  if (centralEnv) {
    console.log(
      `Using TF_VAR_parent_domain_name from environment variable: ${centralEnv}`
    );
    return centralEnv;
  }
  // Next, try to read from central.env file
  try {
    const envFilePath = resolve(__dirname, "..", "central.env");
    if (existsSync(envFilePath)) {
      const envContent = readFileSync(envFilePath, "utf8");
      const match = envContent.match(/^CENTRAL_ENV=(.+)$/m);
      if (match && match[1]) {
        centralEnv = match[1].trim();
        console.log(`Loaded CENTRAL_ENV from central.env: ${centralEnv}`);
        return centralEnv;
      }
    }
    console.error("CENTRAL_ENV not found in central.env. Exiting.");
  } catch (error) {
    console.error("Error reading central.env:", error);
  }
  process.exit(1);
}

let centralDns; // cache variable for CENTRAL_DNS
function getCentralDns() {
  // Return cached value if already loaded
  if (centralDns) {
    return centralDns;
  }
  // First, check if the environment variable is set
  centralDns = process.env.TF_VAR_parent_domain_name; // Prioritize existing env var
  if (centralDns) {
    console.log(
      `Using TF_VAR_parent_domain_name from environment variable: ${centralDns}`
    );
    return centralDns;
  }
  // Next, try to read from central.env file
  try {
    const envFilePath = resolve(__dirname, "..", "central.env");
    if (existsSync(envFilePath)) {
      const envContent = readFileSync(envFilePath, "utf8");
      const match = envContent.match(/^CENTRAL_DNS=(.+)$/m);
      if (match && match[1]) {
        centralDns = match[1].trim();
        console.log(`Loaded CENTRAL_DNS from central.env: ${centralDns}`);
        return centralDns;
      }
    }
    console.error("CENTRAL_DNS not found in central.env. Exiting.");
  } catch (error) {
    console.error("Error reading central.env:", error);
  }
  process.exit(1);
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
      `az role assignment create --assignee ${userId} --role "App Configuration Data Owner" --scope /subscriptions/${getAzureSubscriptionId()}`
    );
    execSync(
      `az role assignment create --assignee ${userId} --role "App Configuration Data Owner" --scope /subscriptions/${getAzureSubscriptionId()}`
    );
  } catch (error) {
    console.error("Failed to activate PIM role:", error);
    process.exit(1);
  }
}

function initEnvironment() {
  const autoApprove = process.argv.includes("--auto-approve");
  const centralEnv = getCentralEnvName();
  process.env.TF_VAR_central_env = centralEnv;
  console.log(`Setting CENTRAL_ENV to: ${process.env.TF_VAR_central_env}`);
  const targetEnv = getTargetEnvName();
  process.env.TF_VAR_target_env = targetEnv;
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  process.env.TF_VAR_subscription_id = getAzureSubscriptionId();
  console.log(
    `Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`
  );
  const resourceGroupName = targetEnv; // name of the resource group where everything will be deployed
  process.env.TF_VAR_resource_group_name = resourceGroupName;
  console.log(
    `Setting resource_group_name to: ${process.env.TF_VAR_resource_group_name}`
  );

  // DNS variables (parameterized to avoid hardcoded values in Terraform)
  const centralDns = getCentralDns();
  process.env.TF_VAR_parent_domain_name = centralDns;
  console.log(
    `Setting parent_domain_name to: ${process.env.TF_VAR_parent_domain_name}`
  );

  activatePimPermissions(); // Ensure we have the necessary permissions

  // Auto-detect existing DNS records and avoid managing them if already present
  try {
    const dnsRg = centralEnv;
    const zone = centralDns;
    const txtName = `_dnsauth.${targetEnv}`;
    const cnameName = `${targetEnv}`;

    let txtExists = false;
    try {
      console.log(
        `az network dns record-set txt show --resource-group ${dnsRg} --zone-name ${zone} --name ${txtName} -o none`
      );
      execSync(
        `az network dns record-set txt show --resource-group ${dnsRg} --zone-name ${zone} --name ${txtName} -o none`,
        { stdio: ["ignore", "ignore", "ignore"], shell: true }
      );
      txtExists = true;
    } catch {}

    let cnameExists = false;
    try {
      execSync(
        `az network dns record-set cname show --resource-group ${dnsRg} --zone-name ${zone} --name ${cnameName} -o none`,
        { stdio: ["ignore", "ignore", "ignore"], shell: true }
      );
      cnameExists = true;
    } catch {}

    if (txtExists) {
      process.env.TF_VAR_manage_dns_txt_validation = "false";
      console.log(
        `Detected existing DNS TXT record ${txtName}.${zone}; will not create it.`
      );
    } else {
      try {
        execSync(
          `az network dns record-set txt add-record --resource-group ${dnsRg} --zone-name ${zone} --record-set-name ${txtName} --value "${txtName}" -o none`,
          { stdio: ["ignore", "ignore", "ignore"], shell: true }
        );
        txtExists = true;
      } catch (e) {
        console.warn("Failed to create DNS TXT record:", e);
      }
      console.log(`DNS TXT record created ${txtName}.${zone}.`);
    }

    if (cnameExists) {
      process.env.TF_VAR_manage_dns_cname = "false";
      console.warn(
        `Detected existing DNS CNAME record ${cnameName}.${zone}, will not create it.`
      );
    } else {
      try {
        execSync(
          `az network dns record-set cname set-record --resource-group ${dnsRg} --zone-name ${zone} --cname ${zone} --record-set-name ${cnameName} -o none`,
          { stdio: ["ignore", "ignore", "ignore"], shell: true }
        );
        cnameExists = true;
      } catch (e) {
        console.warn("Failed to create DNS CNAME record:", e);
      }
      console.log(`DNS CNAME record created ${cnameName}.${zone}.`);
    }
  } catch (e) {
    console.warn(
      "Warning: Unable to auto-detect existing DNS records. Proceeding with defaults. You can override via TF_VAR_manage_dns_txt_validation / TF_VAR_manage_dns_cname.",
      e
    );
  }
}

initEnvironment();
export default { initEnvironment };
