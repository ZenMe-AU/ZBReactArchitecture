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

module.exports = { getSubscriptionId, getFunctionAppPrincipalId, addTemporaryFirewallRule, removeTemporaryFirewallRule };
