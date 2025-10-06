// Test that the deployment succeeded and all dependencies are in place. This test will not change any data.
import { execSync } from "child_process";
import { getTargetEnv } from "../../../module/shared/func/deploy/util/envSetup.js";
import { getStorageAccountWebName, getResourceGroupName, getAppConfigName } from "../../../module/shared/func/deploy/util/namingConvention.js";
import { getAppConfigValueByKeyLabel } from "../../../module/shared/func/deploy/util/azureCli.js";

(async () => {
  try {
    const envType = process.env.TF_VAR_env_type || "dev";
    const targetEnv = getTargetEnv();
    const storageAccountName = getStorageAccountWebName(targetEnv);
    const resourceGroupName = getResourceGroupName(envType, targetEnv);
    const appConfigName = getAppConfigName(targetEnv);
    console.log("Start: Post-Deployment Verification (PDV)");
    // Step 1: Check if static website is enabled
    console.log("PDV Step 1: Check if static website is enabled.");
    const staticWebsite = getStaticWebsiteProperties(storageAccountName);
    if (!staticWebsite.enabled) {
      throw new Error("Static Website is not enabled");
    }
    console.log(`Success: Enabled. Index: ${staticWebsite.indexDocument}, 404: ${staticWebsite.errorDocument404Path}`);

    // Step 2: Check static website endpoint
    console.log("PDV Step 2: Check Static Website endpoint.");
    const endpoint = getStaticWebsiteEndpoint(storageAccountName, resourceGroupName);
    if (!endpoint) {
      throw new Error("Failed to get endpoint");
    }
    console.log(`Endpoint: ${endpoint}`);
    const storedEndpoint = getAppConfigValueByKeyLabel({ appConfigName, key: "webEndpoint", label: envType });
    if (endpoint !== storedEndpoint) {
      throw new Error(`Endpoint from storage (${endpoint}) does not match App Config (${storedEndpoint})`);
    }
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error(`Invalid HTTP response code ${res.status} ${res.statusText}`);
    }
    const body = await res.text();
    if (body.length === 0) {
      throw new Error("Endpoint responded but content is empty");
    } else {
      console.log(`Success: Endpoint responded successfully (${body.length} bytes)`);
    }
    console.log("All deployment checks passed");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();

// Get static website properties from Azure Storage
function getStaticWebsiteProperties(storageAccount) {
  try {
    return JSON.parse(
      execSync(`az storage blob service-properties show --account-name ${storageAccount} --auth-mode login --query "staticWebsite" -o json`, {
        encoding: "utf-8",
      })
    );
  } catch (error) {
    console.error("Error getting static website properties:", error.message);
    throw error;
  }
}

// Get static website endpoint from Azure Storage
function getStaticWebsiteEndpoint(storageAccount, resourceGroup) {
  try {
    return execSync(`az storage account show --name ${storageAccount} --resource-group ${resourceGroup} --query "primaryEndpoints.web" -o tsv`, {
      encoding: "utf-8",
    }).trim();
  } catch (error) {
    console.error("Error getting static website endpoint:", error.message);
    throw error;
  }
}
