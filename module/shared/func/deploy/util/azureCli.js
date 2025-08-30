const { execSync } = require("child_process");

function getSubscriptionId() {
  try {
    return execSync("az account show --query id -o tsv", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch (e) {
    // console.error("Failed to get Azure subscription ID. Please login with Azure CLI.");
    throw new Error("Could not retrieve Azure subscription ID.");
  }
}

/*
 * Get current user objectId
 */
function getObjectId() {
  try {
    return execSync("az ad signed-in-user show --query id -o tsv", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch (e) {
    // console.error("Failed to get Azure subscription ID. Please login with Azure CLI.");
    throw new Error("Could not retrieve Azure subscription ID.");
  }
}

/**
 * Get default Azure location
 */
function getDefaultAzureLocation() {
  try {
    return execSync('az account list-locations --query "[?isDefault].name" -o tsv', { encoding: "utf8" }).trim();
  } catch (e) {
    throw new Error("Failed to get Azure location.");
  }
}

/*
 *  Get the value of a key in a specific label from Azure App Configuration
 */
function getAppConfigValueByKeyLabel({ appConfigName, key, label }) {
  try {
    return execSync(`az appconfig kv show --name "${appConfigName}"  --key "${key}" --label "${label}" --query value -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (e) {
    throw new Error("Could not retrieve Azure App Configuration value.");
  }
}

/**
 * Get Azure Function App principalId
 */
function getFunctionAppPrincipalId({ functionAppName, resourceGroupName }) {
  try {
    return execSync(`az functionapp identity show -n ${functionAppName} -g ${resourceGroupName} --query "principalId" -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (e) {
    // console.error("Failed to get Azure Function App principal ID:", e.message);
    throw new Error("Could not retrieve Azure Function App principal ID.");
  }
}

/**
 * Add a temporary firewall rule for your current IP
 */
function addTemporaryFirewallRule({ resourceGroup, serverName, ruleName, ip }) {
  try {
    console.log(`Adding temporary firewall rule ${ruleName} for IP ${ip}`);
    execSync(
      `az postgres flexible-server firewall-rule create \
     --resource-group ${resourceGroup} \
     --name ${serverName} \
     --rule-name ${ruleName} \
     --start-ip-address ${ip} \
     --end-ip-address ${ip}`,
      { stdio: "inherit" }
    );
  } catch (e) {
    // console.error("Failed to add temporary firewall rule:", e.message);
    throw new Error("Could not add temporary firewall rule.");
  }
}

/**
 * Remove the temporary firewall rule
 */
function removeTemporaryFirewallRule({ resourceGroup, serverName, ruleName }) {
  try {
    console.log(`Removing temporary firewall rule ${ruleName}`);
    execSync(
      `az postgres flexible-server firewall-rule delete \
     --resource-group ${resourceGroup} \
     --name ${serverName} \
     --rule-name ${ruleName} \
     --yes`,
      { stdio: "inherit" }
    );
  } catch (e) {
    // console.error("Failed to remove temporary firewall rule:", e.message);
    throw new Error("Could not remove temporary firewall rule.");
  }
}

/**
 * Set a setting for the Azure Function App
 */
function setFunctionAppSetting({ functionAppName, resourceGroupName, appSettings }) {
  const settingsArgs = Object.entries(appSettings)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
  try {
    return execSync(`az functionapp config appsettings set -n ${functionAppName} -g ${resourceGroupName} --settings ${settingsArgs}`, {
      stdio: "inherit",
      shell: true,
    });
  } catch (e) {
    throw new Error("Could not set Azure Function App settings.");
  }
}

/**
 * Delete settings from the Azure Function App
 */
function deleteFunctionAppSetting({ functionAppName, resourceGroupName, appSettingKeys }) {
  const keys = appSettingKeys.join(" ");
  return execSync(`az functionapp config appsettings delete -n ${functionAppName} -g ${resourceGroupName} --setting-names ${keys}`, {
    stdio: "inherit",
    shell: true,
  });
}

/**
 * Assign a role
 */
function assignRole({ assignee, role, scope }) {
  return execSync(`az role assignment create --assignee ${assignee} --role "${role}" --scope ${scope}`, { stdio: "inherit", shell: true });
}

/**
 * Deploy a zip file to an Azure Function App
 */
function deployFunctionAppZip({ src, functionAppName, resourceGroupName }, { cwd } = {}) {
  return execSync(`az functionapp deployment source config-zip --src "${src}" --name ${functionAppName} --resource-group ${resourceGroupName}`, {
    stdio: "inherit",
    shell: true,
    cwd,
  });
}

/*
 * Create a Service Bus Queue
 */
function createServiceBusQueue({ resourceGroupName, namespaceName, queueName }) {
  try {
    execSync(`az servicebus queue create -g ${resourceGroupName} --namespace-name ${namespaceName} -n ${queueName}`, { stdio: "inherit" });
  } catch (e) {
    throw new Error(`Failed to create queue ${queueName}: ${e.message}`);
  }
}

/*
 * Add a member to an AAD group
 */
function addMemberToAadGroup({ groupIdOrName, memberId }) {
  try {
    if (!isMemberOfAadGroup({ groupIdOrName, memberId })) {
      execSync(`az ad group member add --group ${groupIdOrName} --member-id ${memberId}`, { stdio: "inherit" });
    }
  } catch (e) {
    throw new Error(`Failed to add member to AAD group: ${e.message}`);
  }
}
/*
 * Check if a user is member of an AAD group
 */
function isMemberOfAadGroup({ groupIdOrName, memberId }) {
  try {
    const isMember = execSync(`az ad group member check --group ${groupIdOrName} --member-id ${memberId} --query value -o tsv`, {
      encoding: "utf8",
    }).trim();
    return isMember === "true";
  } catch (e) {
    throw new Error(`Failed to check membership in AAD group: ${e.message}`);
  }
}

/*
Check if a storage account name is available
 */
function isStorageAccountNameAvailable(name) {
  try {
    const result = execSync(`az storage account check-name --name ${name} --query nameAvailable -o tsv`, {
      encoding: "utf8",
    }).trim();
    return result === "true";
  } catch (e) {
    throw new Error(`Failed to check storage account name availability: ${e.message}`);
  }
}

function addPgServerExtensionsList({ resourceGroup, serverName, subscriptionId, extensionNames }) {
  execSync(`az postgres flexible-server parameter set \
  --resource-group ${resourceGroup} \
  --server-name ${serverName} \
  --subscription ${subscriptionId} \
  --name azure.extensions \
  --value ${extensionNames.join(",")}`);
}

module.exports = {
  getSubscriptionId,
  getObjectId,
  getDefaultAzureLocation,
  getAppConfigValueByKeyLabel,
  getFunctionAppPrincipalId,
  addTemporaryFirewallRule,
  removeTemporaryFirewallRule,
  setFunctionAppSetting,
  deleteFunctionAppSetting,
  assignRole,
  deployFunctionAppZip,
  createServiceBusQueue,
  addMemberToAadGroup,
  addPgServerExtensionsList,
  isMemberOfAadGroup,
  isStorageAccountNameAvailable,
};
