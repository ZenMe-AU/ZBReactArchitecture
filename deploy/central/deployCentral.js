/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { execSync } from "child_process";
// import { createInterface } from "readline";
import { existsSync, readFileSync } from "fs";
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
  } catch {
    console.error(
      "Failed to get Azure subscription ID. Make sure you are logged in with Azure CLI."
    );
    process.exit(1);
  }
}

// Removed TARGET_ENV logic: Front Door foundation must be environment-agnostic.
// Endpoint-specific scripts will supply their own domains/hostnames later.

function getOptionalCustomDomainHost() {
  const host = process.env.FD_CUSTOM_DOMAIN || process.env.TF_VAR_fd_custom_domain;
  if (host) {
    console.log(`Using custom domain host from environment override: ${host}`);
    return host.trim();
  }
  return null;
}

let centralEnv;
function getCentralEnvName() {
  if (centralEnv) {
    return centralEnv;
  }
  // First, check if the environment variable is set
  // Prefer explicit central env variable (resource group name), not the DNS name
  centralEnv = process.env.TF_VAR_central_env || process.env.CENTRAL_ENV; // Prioritize existing env var
  if (centralEnv) {
    console.log(
      `Using CENTRAL_ENV from environment variable: ${centralEnv}`
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

function createDns(dnsRg, zone, subdomain, validationToken) {
  // Auto-detect existing DNS records and avoid managing them if already present
  try {
  const txtName = subdomain && subdomain.length > 0 ? `_dnsauth.${subdomain}` : `_dnsauth`;

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
    } catch {
      // Record not found; will attempt to create
    }

    if (txtExists) {
      process.env.TF_VAR_manage_dns_txt_validation = "false";
      console.log(
        `Detected existing DNS TXT record ${txtName}.${zone}, will not create it.`
      );
    } else {
      try {
        execSync(
          `az network dns record-set txt add-record --resource-group ${dnsRg} --zone-name ${zone} --record-set-name ${txtName} --value "${validationToken}" -o none`,
          { stdio: ["ignore", "ignore", "ignore"], shell: true }
        );
        txtExists = true;
        console.log(`DNS TXT record created ${txtName}.${zone}.`);
      } catch (e) {
        console.warn("Failed to create DNS TXT record:", e);
      }
    }
  } catch (e) {
    console.warn(
      "Warning: Unable to manage DNS validation TXT record",
      e
    );
  }
}

/**
 * Create an empty Azure Front Door (Standard/Premium) profile with no endpoints/routes.
 * - Uses the provided resource group (CENTRAL_ENV) so nothing is hard-coded.
 * - Idempotent: skips creation if the profile/custom domain already exist.
 * - Attempts to add a custom domain for `${targetEnv}.${centralDns}` if possible.
 */
// Helper: ensure front-door CLI extension
function ensureFrontDoorExtension() {
  // If 'az afd' is already available, skip installation.
  try {
    execSync(`az afd -h`, { stdio: "ignore", shell: true });
    return;
  } catch (e) { void e; }

  // Ensure legacy 'front-door' extension which commonly provides 'az afd' commands.
  try {
    console.log("Ensuring Azure CLI 'front-door' extension is installed...");
    execSync(`az extension show --name front-door -o none`, { stdio: "ignore", shell: true });
  } catch {
    try {
      execSync(`az extension add --name front-door -o none`, { stdio: "inherit", shell: true });
    } catch (e) {
      console.warn("Failed to add 'front-door' extension:", e?.message ?? e);
    }
  }

  // If still unavailable, try newer 'afd' extension where supported.
  try {
    execSync(`az afd -h`, { stdio: "ignore", shell: true });
    return;
  } catch (e) { void e; }
  try {
    console.log("Attempting to install Azure CLI 'afd' extension...");
    execSync(`az extension add --name afd -o none`, { stdio: "inherit", shell: true });
  } catch (e) {
    void e;
    // Last check before failing hard.
    try {
      execSync(`az afd -h`, { stdio: "ignore", shell: true });
      return;
    } catch (e) { void e; }
    throw new Error("Azure CLI 'afd' commands are unavailable. Install 'front-door' or 'afd' extension.");
  }
}

// Helper: ensure resource group exists
function ensureResourceGroup(resourceGroup) {
  try {
    execSync(`az group show -n ${resourceGroup} -o none`, { stdio: "ignore", shell: true });
  } catch (e) {
    console.error(`Required resource group '${resourceGroup}' not found. Create it first and rerun.`, e?.message ?? e);
    process.exit(1);
  }
}

// Helper: check if AFD profile exists
function afdProfileExists(resourceGroup, profileName) {
  try {
    execSync(`az afd profile show -g ${resourceGroup} -n ${profileName} -o none`, { stdio: "ignore", shell: true });
    return true;
  } catch {
    return false;
  }
}

// Helper: create AFD profile
function createAfdProfile(resourceGroup, profileName, sku) {
  console.log(`Creating Azure Front Door Standard profile: rg=${resourceGroup}, name=${profileName}`);
  execSync(`az afd profile create -g ${resourceGroup} -n ${profileName} --sku ${sku} -o none`, { stdio: "ignore", shell: true });
}

// Helper: get or create custom domain and return its sanitized resource name
function getOrCreateCustomDomain(resourceGroup, profileName, hostName) {
  const customDomainName = hostName.replace(/\./g, "-");
  try {
    execSync(`az afd custom-domain show -g ${resourceGroup} --profile-name ${profileName} -n ${customDomainName} -o none`, { stdio: "ignore", shell: true });
    console.log(`AFD custom domain already exists: ${customDomainName} (host: ${hostName})`);
    return customDomainName;
  } catch (e) {
    console.log(`AFD custom domain not found or check failed for '${customDomainName}': ${e?.message ?? e}`);
  }
  try {
    console.log(`Creating AFD custom domain '${customDomainName}' for host '${hostName}' on profile '${profileName}'`);
    execSync(`az afd custom-domain create -g ${resourceGroup} --profile-name ${profileName} -n ${customDomainName} --host-name ${hostName} -o none`, { stdio: ["ignore", "ignore", "ignore"], shell: true });
  } catch (e) {
    console.warn(`Warning: Failed to create/verify AFD custom domain '${customDomainName}'.`, e?.message ?? e);
  }
  return customDomainName;
}

// Helper: fetch validation token & state
function fetchCustomDomainValidation(resourceGroup, profileName, customDomainName) {
  try {
    const token = execSync(`az afd custom-domain show -g ${resourceGroup} --profile-name ${profileName} -n ${customDomainName} --query validationProperties.validationToken -o tsv`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], shell: true }).toString().trim();
    const state = execSync(`az afd custom-domain show -g ${resourceGroup} --profile-name ${profileName} -n ${customDomainName} --query domainValidationState -o tsv`, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"], shell: true }).toString().trim();
    return { token, state };
  } catch (e) {
    console.warn(`Warning: Unable to fetch validation token/state for custom domain '${customDomainName}'.`, e?.message ?? e);
    return { token: null, state: null };
  }
}

// Helper: perform DNS TXT validation if needed
function performDomainValidation(resourceGroup, profileName, zone, hostName, customDomainName) {
  const { token, state } = fetchCustomDomainValidation(resourceGroup, profileName, customDomainName);
  if (!token) return;
  if (state && state.toLowerCase() === "approved") {
    console.log(`Custom domain '${hostName}' is already validated (state: ${state}).`);
    return;
  }
  // Derive subdomain relative to the known zone (CENTRAL_DNS)
  let sub = "";
  if (hostName === zone) {
    sub = ""; // apex
  } else if (hostName.endsWith(`.${zone}`)) {
    sub = hostName.slice(0, hostName.length - (zone.length + 1));
  } else {
    console.warn(`Host '${hostName}' does not match zone '${zone}'; skipping DNS TXT creation.`);
    return;
  }
  createDns(resourceGroup, zone, sub, token);
  console.log(`Requested DNS TXT validation for ${hostName}. After propagation, validation should complete automatically.`);
}

function createEmptyFrontDoor({
  resourceGroup = getCentralEnvName(),
  profileName = "FrontDoor",
  customDomainHost = getOptionalCustomDomainHost() || getCentralDns(), // default to apex (CENTRAL_DNS)
  sku = "Standard_AzureFrontDoor",
}) {
  try {
    ensureFrontDoorExtension();
    ensureResourceGroup(resourceGroup);
    if (!afdProfileExists(resourceGroup, profileName)) {
      createAfdProfile(resourceGroup, profileName, sku);
    } else {
      console.log(`Azure Front Door profile already exists: rg=${resourceGroup}, name=${profileName}`);
    }
    const zone = getCentralDns();
    const customDomainName = getOrCreateCustomDomain(resourceGroup, profileName, customDomainHost);
    performDomainValidation(resourceGroup, profileName, zone, customDomainHost, customDomainName);
  } catch (error) {
    console.error("Failed to create empty Azure Front Door:", error);
  }
}

function initEnvironment() {
  // const autoApprove = process.argv.includes("--auto-approve");
  const centralEnv = getCentralEnvName();
  process.env.TF_VAR_central_env = centralEnv;
  console.log(`Setting CENTRAL_ENV to: ${process.env.TF_VAR_central_env}`);
  process.env.TF_VAR_subscription_id = getAzureSubscriptionId();
  console.log(
    `Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`
  );

  // DNS variables (parameterized to avoid hardcoded values in Terraform)
  const centralDns = getCentralDns();
  process.env.TF_VAR_parent_domain_name = centralDns;
  console.log(
    `Setting parent_domain_name to: ${process.env.TF_VAR_parent_domain_name}`
  );

  activatePimPermissions(); // Ensure we have the necessary permissions (if required elsewhere)

  // Create an empty Front Door in the CENTRAL_ENV resource group
  createEmptyFrontDoor({
    resourceGroup: centralEnv,
    profileName: `FrontDoor`,
  });
}

initEnvironment();
export default { initEnvironment };
