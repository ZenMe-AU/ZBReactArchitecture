import { execSync } from "child_process";
import { getResourceGroupName, getApimName } from "../util/namingConvention.cjs";
import { getSubscriptionId, getApimBackendList } from "../util/azureCli.cjs";
import { getTargetEnv } from "../util/envSetup.cjs";

function getApimFragmentUrl(subscriptionId, resourceGroup, apimName, fragmentName) {
  return `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ApiManagement/service/${apimName}/policyFragments/${fragmentName}?api-version=2024-05-01`;
}

function updateFragment(subscriptionId, resourceGroup, apimName, fragmentName, xml, format = "xml") {
  const url = getApimFragmentUrl(subscriptionId, resourceGroup, apimName, fragmentName);
  const body = JSON.stringify({
    properties: {
      value: xml,
      format,
    },
  });
  const result = execSync(`az rest --method put --url "${url}" --headers "Content-Type=application/json" --body @-`, { encoding: "utf8", input: body });
  return result;
}

async function waitFragmentReady(subscriptionId, resourceGroup, apimName, fragmentName, interval = 2000, timeout = 60000) {
  const url = getApimFragmentUrl(subscriptionId, resourceGroup, apimName, fragmentName);
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const state = execSync(`az rest --method get --url "${url}" --query "properties.provisioningState" -o tsv`, { encoding: "utf8" }).trim();
    if (state === "Succeeded") return true;
    if (state === "Failed") throw new Error("APIM fragment update failed");
    console.log("ProvisioningState:", state, `Waiting for ${interval / 1000}s`);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error("Timeout waiting for APIM fragment to be ready");
}

function renderTemplate(tplPath, inputs) {
  // const cmd = `terraform console -no-color -input=false <<< 'templatefile("${tplPath}", ${JSON.stringify(inputs)})'`;
  const cmd = `echo 'templatefile("${tplPath}", ${JSON.stringify(inputs)})' | terraform console -no-color -input=false`;
  const raw = execSync(cmd, { encoding: "utf8", stdio: "pipe" }).trim();
  const match = raw.match(/<<EOT\n([\s\S]*?)\nEOT/);
  if (!match) throw new Error(`Unexpected terraform output:\n${raw}`);
  return match[1].trim();
}

const fragmentName = "backend-routing-fragment";

async function main() {
  try {
    console.log("Starting updating apim routing policy fragment.");
    const envType = process.env.TF_VAR_env_type || "dev";
    const subscriptionId = getSubscriptionId();
    const targetEnv = getTargetEnv();
    const resourceGroup = getResourceGroupName(envType, targetEnv);
    const apimName = getApimName(targetEnv);
    const backends = getApimBackendList(subscriptionId, resourceGroup, apimName);
    const xml = renderTemplate("routing_fragment.tpl", { backends, targetEnv });
    updateFragment(subscriptionId, resourceGroup, apimName, fragmentName, xml, "rawxml");
    await waitFragmentReady(subscriptionId, resourceGroup, apimName, fragmentName);
    console.log("Policy fragment updated successfully.");
  } catch (error) {
    console.error("Failed to update apim routing policy fragment:", error.message);
    process.exit(1);
  }
}

export function run() {
  main().catch((error) => {
    console.error("Error in updateApimRoutingPolicy:", error);
    process.exit(1);
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  await main();
}
