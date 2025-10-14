import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import {
  getResourceGroupName,
  getStorageAccountName,
  getAppConfigName,
  getLogAnalyticsWorkspaceName,
  getServiceBusName,
  getPgServerName,
  getDbAdminName,
  getIdentityName,
  getAppInsightsName,
} from "../../module/shared/func/deploy/util/namingConvention.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// function getResourceGroupName(envType, targetEnv) {
//   return `${envType}-${targetEnv}`;
// }
// function getStorageAccountName(targetEnv) {
//   return `${targetEnv}`;
// }
// function getAppConfigName(targetEnv) {
//   return `${targetEnv}-appconfig`;
// }
// function getLogAnalyticsWorkspaceName(targetEnv) {
//   return `${targetEnv}-law`;
// }
// function getServiceBusName(targetEnv) {
//   return `${targetEnv}-sbnamespace`;
// }
// function getPgServerName(targetEnv) {
//   return `${targetEnv}-postgresqlserver`;
// }
// function getDbAdminName(envType) {
//   const suffix = envType.charAt(0).toUpperCase() + envType.slice(1);
//   return `DbAdmin-${suffix}`;
// }
// function getIdentityName(targetEnv) {
//   return `${targetEnv}-identity`;
// }
// function getAppInsightsName(targetEnv) {
//   return `${targetEnv}-appinsights`;
// }

let cachedSubscriptionId = null;
function getAzureSubscriptionId() {
  if (cachedSubscriptionId) {
    return cachedSubscriptionId;
  }
  try {
    const output = execSync("az account show --query id -o tsv", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
    cachedSubscriptionId = output.trim();
    return cachedSubscriptionId;
  } catch (error) {
    console.error("Failed to get Azure subscription ID. Make sure you are logged in with Azure CLI.");
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

/** Activate PIM role "App Configuration Data Owner" for the current user for the current tenant.
 * This activation will usually expire within 8 hours and need to be re-activated every time it's needed.
 */
function activatePimPermissions() {
  try {
    // Get current user id from Azure CLI
    const userId = execSync("az ad signed-in-user show --query id -o tsv", { encoding: "utf8" }).trim();
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
  const envType = process.env.TF_VAR_env_type;
  const targetEnv = getTargetEnvName();
  process.env.TF_VAR_target_env = targetEnv;
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  process.env.TF_VAR_subscription_id = getAzureSubscriptionId();
  console.log(`Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`);
  const resourceGroupName = getResourceGroupName(envType, targetEnv);
  process.env.TF_VAR_resource_group_name = resourceGroupName;
  console.log(`Setting resource_group_name to: ${process.env.TF_VAR_resource_group_name}`);
  const storageAccountName = getStorageAccountName(targetEnv);
  process.env.TF_VAR_storage_account_name = storageAccountName;
  console.log(`Setting storage_account_name to: ${process.env.TF_VAR_storage_account_name}`);
  const appConfigName = getAppConfigName(targetEnv);
  process.env.TF_VAR_appconfig_name = appConfigName;
  console.log(`Setting appconfig_name to: ${process.env.TF_VAR_appconfig_name}`);

  // DNS variables (parameterized to avoid hardcoded values in Terraform)
  process.env.TF_VAR_parent_domain_name = process.env.TF_VAR_parent_domain_name || "zenblox.com.au";
  console.log(`Setting parent_domain_name to: ${process.env.TF_VAR_parent_domain_name}`);
  // Determine DNS resource group: prefer explicit env var; otherwise auto-detect by zone name; fallback to sensible default
  try {
    if (!process.env.TF_VAR_dns_resource_group_name) {
      const zone = process.env.TF_VAR_parent_domain_name;
      // Query all DNS zones and find the RG for the specified zone name
      const rg = execSync(
        `az network dns zone list --query "[?name=='${zone}'].resourceGroup | [0]" -o tsv`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], shell: true }
      )
        .toString()
        .trim();
      if (rg) {
        process.env.TF_VAR_dns_resource_group_name = rg;
        console.log(`Auto-detected dns_resource_group_name: ${rg}`);
      } else {
        // Fallback: commonly used RG for shared DNS zones
        process.env.TF_VAR_dns_resource_group_name = "root-zenblox";
        console.warn(
          `Could not auto-detect DNS RG for zone '${zone}'. Defaulting to: ${process.env.TF_VAR_dns_resource_group_name}`
        );
      }
    }
  } catch (e) {
    process.env.TF_VAR_dns_resource_group_name = process.env.TF_VAR_dns_resource_group_name || "root-zenblox";
    console.warn(
      `Warning: DNS RG auto-detect failed. Using dns_resource_group_name=${process.env.TF_VAR_dns_resource_group_name}`
    );
  }
  console.log(`Setting dns_resource_group_name to: ${process.env.TF_VAR_dns_resource_group_name}`);

  // Auto-detect existing DNS records and avoid managing them if already present
  try {
    const dnsRg = process.env.TF_VAR_dns_resource_group_name;
    const zone = process.env.TF_VAR_parent_domain_name;
    const txtName = `_dnsauth.${targetEnv}`;
    const cnameName = `${targetEnv}`;

    let txtExists = false;
    try {
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
        `Detected existing DNS TXT record ${txtName}.${zone}; will not manage it (manage_dns_txt_validation=false).`
      );
    } else {
      process.env.TF_VAR_manage_dns_txt_validation = process.env.TF_VAR_manage_dns_txt_validation || "true";
      console.log(
        `DNS TXT record ${txtName}.${zone} not found; Terraform will create/manage it (manage_dns_txt_validation=${process.env.TF_VAR_manage_dns_txt_validation}).`
      );
    }

    if (cnameExists) {
      process.env.TF_VAR_manage_dns_cname = "false";
      console.log(
        `Detected existing DNS CNAME record ${cnameName}.${zone}; will not manage it (manage_dns_cname=false).`
      );
    } else {
      process.env.TF_VAR_manage_dns_cname = process.env.TF_VAR_manage_dns_cname || "true";
      console.log(
        `DNS CNAME record ${cnameName}.${zone} not found; Terraform will create/manage it (manage_dns_cname=${process.env.TF_VAR_manage_dns_cname}).`
      );
    }
  } catch (e) {
    console.warn(
      "Warning: Unable to auto-detect existing DNS records. Proceeding with defaults. You can override via TF_VAR_manage_dns_txt_validation / TF_VAR_manage_dns_cname."
    );
  }

  process.env.TF_VAR_log_analytics_workspace_name = getLogAnalyticsWorkspaceName(targetEnv);
  console.log(`Setting log_analytics_workspace_name to: ${process.env.TF_VAR_log_analytics_workspace_name}`);
  process.env.TF_VAR_service_bus_name = getServiceBusName(targetEnv);
  console.log(`Setting service_bus_name to: ${process.env.TF_VAR_service_bus_name}`);
  process.env.TF_VAR_postgresql_server_name = getPgServerName(targetEnv);
  console.log(`Setting postgresql_server_name to: ${process.env.TF_VAR_postgresql_server_name}`);
  process.env.TF_VAR_db_admin_group_name = getDbAdminName(envType);
  console.log(`Setting db_admin_group_name to: ${process.env.TF_VAR_db_admin_group_name}`);
  process.env.TF_VAR_identity_name = getIdentityName(targetEnv);
  console.log(`Setting identity_name to: ${process.env.TF_VAR_identity_name}`);
  process.env.TF_VAR_app_insights_name = getAppInsightsName(targetEnv);
  console.log(`Setting app_insights_name to: ${process.env.TF_VAR_app_insights_name}`);
  //  process.env.TF_LOG = "DEBUG";
  //  console.log(`Setting TF_LOG to: ${process.env.TF_LOG}`);
  activatePimPermissions();

  try {
    execSync(
      `terraform init -reconfigure\
        -backend-config="resource_group_name=${resourceGroupName}" \
        -backend-config="storage_account_name=${storageAccountName}" \
        -backend-config="container_name=terraformstate" \
        -backend-config="key=${targetEnv}/${targetEnv}-terraform.tfstate"`,
      { stdio: "inherit", shell: true }
    );
    console.log("Terraform initialized successfully.");

    // Run terraform plan
    // execSync("terraform plan -out=planfile", { stdio: "inherit", shell: true });
    // console.log("Terraform plan completed successfully.");

    // Prompt user for confirmation before applying changes
    console.log("You are about to run 'terraform apply'. This will make changes to your infrastructure.");
    if (autoApprove) {
      try {
        execSync("terraform apply -auto-approve", { stdio: "inherit", shell: true });
      } catch (error) {
        console.error("Terraform apply failed:", error);
        process.exit(1);
      }
    } else {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question("Do you want to continue and run 'terraform apply'? (y/N): ", (answer) => {
        rl.close();
        if (answer.trim().toLowerCase() === "y") {
          try {
            execSync("terraform apply -auto-approve", { stdio: "inherit", shell: true });
          } catch (error) {
            console.error("Terraform apply failed:", error);
            process.exit(1);
          }
        } else {
          console.log("Aborted terraform apply.");
        }
      });
    }
  } catch (error) {
    console.error("Terraform command failed:", error);
    process.exit(1);
  }
}

initEnvironment();
export default { initEnvironment };
