/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { execSync } = require("child_process");

function getSubscriptionId(name = null) {
  try {
    if (name) {
      return execSync(`az account list --query "[?name=='${name}'].id" -o tsv`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      }).trim();
    }
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

function getIdentityClientId({ identityName, resourceGroupName }) {
  try {
    return execSync(`az identity show -n ${identityName} -g ${resourceGroupName} --query clientId -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (e) {
    throw new Error("Could not retrieve Azure Identity Client ID.");
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
 * Get Application Insights connection string
 * appInsightsName: name of the Application Insights resource
 * resourceGroupName: name of the resource group containing the Application Insights resource
 */
function getAppInsightsConnectionString({ appInsightsName, resourceGroupName }) {
  try {
    return execSync(`az monitor app-insights component show --app ${appInsightsName} --resource-group ${resourceGroupName} --query connectionString -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (e) {
    throw new Error("Could not retrieve Application Insights connection string.");
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
 * appSettings must be an object
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
 * appSettingKeys must be an array
 */
function deleteFunctionAppSetting({ functionAppName, resourceGroupName, appSettingKeys }) {
  const keys = appSettingKeys.join(" ");
  return execSync(`az functionapp config appsettings delete -n ${functionAppName} -g ${resourceGroupName} --setting-names ${keys}`, {
    stdio: "inherit",
    shell: true,
  });
}

/**
 * Set CORS settings for the Azure Function App
 * allowedOrigins must be an array
 */
function setFunctionAppCors({ functionAppName, resourceGroupName, allowedOrigins }) {
  const origins = allowedOrigins.join(" ");
  try {
    execSync(`az functionapp cors add -n ${functionAppName} -g ${resourceGroupName} --allowed-origins ${origins}`, {
      stdio: "inherit",
      shell: true,
    });
  } catch (e) {
    throw new Error("Could not set Azure Function App CORS settings.");
  }
}

/**
 * Remove CORS settings for the Azure Function App
 */
function removeFunctionAppCors({ functionAppName, resourceGroupName, allowedOrigins }) {
  try {
    execSync(`az functionapp cors remove -n ${functionAppName} -g ${resourceGroupName} --allowed-origins ${allowedOrigins}`, {
      stdio: "inherit",
      shell: true,
    });
  } catch (e) {
    throw new Error("Could not remove Azure Function App CORS settings.");
  }
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

/*
 * Get Event Grid Namespace ID
 */
function getEventGridNamespaceId({ resourceGroupName, eventGridNamespaceName }) {
  try {
    return execSync(`az eventgrid namespace show -n ${eventGridNamespaceName} -g ${resourceGroupName} --query id -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    throw new Error("Could not retrieve Event Grid Namespace ID." + error.message);
  }
}

/*
 * Get Event Grid Domain ID
 */
function getEventGridDomainId({ resourceGroupName, eventGridDomainName }) {
  try {
    return execSync(`az eventgrid domain show -n ${eventGridDomainName} -g ${resourceGroupName} --query id -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    throw new Error("Could not retrieve Event Grid Domain ID." + error.message);
  }
}

/*
 * Get Event Grid Namespace Hostname
 */
function getEventGridNamespaceHostname({ resourceGroupName, eventGridNamespaceName }) {
  try {
    return execSync(`az eventgrid namespace show -n ${eventGridNamespaceName} -g ${resourceGroupName} --query "topicsConfiguration.hostname" -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    throw new Error("Could not retrieve Event Grid Namespace Hostname." + error.message);
  }
}

/*
 * Get Event Grid Domain Endpoint
 */
function getEventGridDomainEndpoint({ resourceGroupName, eventGridDomainName }) {
  try {
    return execSync(`az eventgrid domain show -n ${eventGridDomainName} -g ${resourceGroupName} --query endpoint -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    throw new Error("Could not retrieve Event Grid Domain Endpoint." + error.message);
  }
}

/*
 * Get Event Grid topic Endpoint
 */
function getEventGridTopicEndpoint({ resourceGroupName, eventGridName }) {
  try {
    return execSync(`az eventgrid topic show -n ${eventGridName} -g ${resourceGroupName} --query endpoint -o tsv`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    throw new Error("Could not retrieve Event Grid Topic Endpoint." + error.message);
  }
}

function createEventGridTopic({ resourceGroupName, eventGridNamespaceName, topicName }) {
  try {
    execSync(`az eventgrid namespace topic create -g ${resourceGroupName} --namespace-name ${eventGridNamespaceName} -n ${topicName}`, {
      stdio: "inherit",
    });
  } catch (error) {
    throw new Error("Could not create Event Grid Topic." + error.message);
  }
}

function getEventGridTopicList({ resourceGroupName, eventGridNamespaceName }) {
  try {
    return execSync(`az eventgrid namespace topic list -g ${resourceGroupName} --namespace-name ${eventGridNamespaceName} --query "[].name" -o json`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    throw new Error("Could not list Event Grid Topics." + error.message);
  }
}

function getEventGridSubscriptionList({ resourceGroupName, eventGridName }) {
  try {
    return execSync(`az eventgrid topic event-subscription list -g ${resourceGroupName} --topic-name ${eventGridName} --query "[].name" -o json`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    throw new Error("Could not list Event Grid Subscriptions." + error.message);
  }
}
// az eventgrid event-subscription create \
//   --name CreateQuestionSub \
//   --source-resource-id /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/my-rg/providers/Microsoft.EventGrid/namespaces/test-egnamespace/topics/CreateQuestionTopic \
//   --endpoint https://$FUNC_HOSTNAME/runtime/webhooks/eventgrid?functionName=CreateQuestionQueue&code=$FUNC_KEY

module.exports = {
  getSubscriptionId,
  getObjectId,
  getDefaultAzureLocation,
  getIdentityClientId,
  getAppInsightsConnectionString,
  getAppConfigValueByKeyLabel,
  getFunctionAppPrincipalId,
  addTemporaryFirewallRule,
  removeTemporaryFirewallRule,
  setFunctionAppSetting,
  deleteFunctionAppSetting,
  setFunctionAppCors,
  removeFunctionAppCors,
  assignRole,
  deployFunctionAppZip,
  createServiceBusQueue,
  addMemberToAadGroup,
  addPgServerExtensionsList,
  isMemberOfAadGroup,
  isStorageAccountNameAvailable,
  getEventGridNamespaceId,
  getEventGridDomainId,
  getEventGridNamespaceHostname,
  getEventGridDomainEndpoint,
  getEventGridTopicEndpoint,
  createEventGridTopic,
  getEventGridTopicList,
  getEventGridSubscriptionList,
};
