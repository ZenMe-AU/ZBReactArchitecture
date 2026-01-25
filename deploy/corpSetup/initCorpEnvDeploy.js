/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

/* This script configures the corporate environment with the relevant permissions to allow automated deployments.
 */
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
// import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { getResourceGroupName, getLogAnalyticsWorkspaceName, getAppConfigName } from "../util/namingConvention.cjs";
import { getSubscriptionId, getDefaultAzureLocation, isStorageAccountNameAvailable } from "../util/azureCli.cjs";
import minimist from "minimist";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function setTfVar(name, value) {
  const envKey = `TF_VAR_${name}`;
  process.env[envKey] = value;

  console.log(`Setting terraform variable ${name} to: ${value}`);
}

const env = {
  // please don't modify data, path and loaded directly
  data: null,
  path: null,
  loaded: false,

  loadFromFile(filePath) {
    this.path = filePath;
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, "utf8");
      this.data = dotenv.parse(content);
      this.loaded = true;
    } else {
      // or should we throw error here?
      this.data = {}; // If file does not exist, initialize with empty object
      this.loaded = true;
    }
  },

  ensureLoaded() {
    if (!this.loaded) {
      throw new Error("Env file has not been loaded. Call load() first.");
    }
  },

  get(key, defaultValue = undefined) {
    this.ensureLoaded();
    return this.data[key] ?? defaultValue;
  },

  set(key, value) {
    this.ensureLoaded();
    this.data[key] = String(value);
  },

  add(key, value) {
    this.ensureLoaded();

    if (key in this.data) {
      throw new Error(`ENV key "${key}" already exists`);
    }
    this.data[key] = String(value);
  },

  edit(key, value) {
    this.ensureLoaded();

    if (!(key in this.data)) {
      throw new Error(`ENV key "${key}" does not exist`);
    }
    this.data[key] = String(value);
  },

  delete(key) {
    this.ensureLoaded();
    delete this.data[key];
  },

  saveToFile() {
    this.ensureLoaded();

    if (!this.path) {
      throw new Error("Env file path is not set");
    }

    const content =
      "# if there is no subscription ID, which means no existing subscription, the script will create a new subscription under the billing account provided during c01(bootstrap) stage.\n" +
      Object.entries(this.data)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

    writeFileSync(this.path, content);
  },
};

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

function main() {
  const autoApprove = process.argv.includes("--auto-approve");
  const args = minimist(process.argv.slice(2));
  const stage = args.stage;
  const stageRegex = /^c\d{2}$/;

  try {
    // Validate stage argument
    if (!stage) {
      throw new Error("Stage is required.");
    }
    // Validate stage format
    if (!stageRegex.test(stage)) {
      throw new Error("Invalid stage format. Expected format: cXX");
    }
    // Find the working directory that matches the stage
    const workingDirName = readdirSync(__dirname, { withFileTypes: true }).find((dir) => dir.isDirectory() && dir.name.startsWith(stage))?.name;
    if (!workingDirName) {
      throw new Error(`No directory found for stage: ${stage}`);
    }
    console.log("workingDir:", workingDirName);
    const corpEnvFile = resolve(__dirname, "corp.env");
    if (!existsSync(corpEnvFile)) {
      throw new Error("corp.env file not found.");
    }
    env.loadFromFile(corpEnvFile);
    const corpName = env.get("NAME");
    if (!corpName) {
      throw new Error("NAME is not set in corp.env.");
    }
    let tfStateList = [];
    try {
      tfStateList = execSync("terraform state list", { cwd: resolve(__dirname, workingDirName), encoding: "utf8", stdio: "pipe" })
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    } catch {}
    switch (workingDirName) {
      case "c01subscription": {
        // check necessary parameters
        // const corpName = env.get("NAME");
        // if (!corpName) {
        //   throw new Error("NAME is not set in corp.env.");
        // }
        const subscription_name = `${corpName}-subscription`;

        // set terraform variables
        setTfVar("subscription_name", subscription_name);
        setTfVar("subscription_id", getSubscriptionId());
        // setTfVar("billing_account_name", env.get("BILLING_ACCOUNT_NAME"));
        // setTfVar("billing_profile_name", env.get("BILLING_PROFILE_NAME"));
        // setTfVar("invoice_section_name", env.get("INVOICE_SECTION_NAME"));
        setTfVar("contact_emails", '["jake.vosloo@outlook.com", "LukeYeh@zenme.com.au"]'); // check if working on windows os

        execSync(`terraform init`, { stdio: "pipe", shell: true, cwd: resolve(__dirname, workingDirName) });

        // import existing resource
        let subscriptionId =
          // env.get("SUBSCRIPTION_ID") ?? execSync(`az account list --query "[?name=='${subscription_name}'].id" -o tsv`, { encoding: "utf8" }).trim();
          env.get("SUBSCRIPTION_ID") ?? getSubscriptionId(subscription_name);

        if (subscriptionId && subscriptionId.length > 0) {
          // try {
          //   // check if already imported
          //   execSync(`terraform state show azurerm_subscription.payg`, {
          //     stdio: "inherit",
          //     shell: true,
          //     cwd: resolve(__dirname, workingDirName),
          //   });
          // } catch {}

          // try {
          //   // check if already imported
          //   execSync(`terraform state show azurerm_consumption_budget_subscription.payg_budget`, {
          //     stdio: "inherit",
          //     shell: true,
          //     cwd: resolve(__dirname, workingDirName),
          //   });
          // } catch {}
          console.log("tfStateList:", tfStateList);
          console.log("azurerm_subscription.payg exists:", tfStateList.includes("azurerm_subscription.payg"));
          console.log(
            "azurerm_consumption_budget_subscription.payg_budget exists:",
            tfStateList.includes("azurerm_consumption_budget_subscription.payg_budget")
          );
          if (!tfStateList.includes("azurerm_subscription.payg")) {
            const aliasId = execSync(`az account alias list --query "value[?properties.subscriptionId=='${subscriptionId}'].id" -o tsv`, {
              encoding: "utf8",
              stdio: "pipe",
            }).trim();
            console.log("Importing existing Subscription with ID:", subscriptionId);
            execSync(`terraform import azurerm_subscription.payg ${aliasId}`, {
              stdio: "pipe",
              shell: true,
              cwd: resolve(__dirname, workingDirName),
            });
            // execSync(`terraform state show azurerm_subscription.payg`, {
            //   stdio: "inherit",
            //   shell: true,
            //   cwd: resolve(__dirname, workingDirName),
            // });
          }
          if (!tfStateList.includes("azurerm_consumption_budget_subscription.payg_budget")) {
            const budget = execSync(`az consumption budget list --subscription ${subscriptionId} --query "[?name=='monthly-budget'].name" -o tsv`, {
              encoding: "utf8",
              stdio: "pipe",
            }).trim();
            if (budget && budget.length > 0) {
              console.log("Importing existing monthly-budget");
              execSync(
                `terraform import azurerm_consumption_budget_subscription.payg_budget /subscriptions/${subscriptionId}/providers/Microsoft.Consumption/budgets/monthly-budget`,
                {
                  stdio: "pipe",
                  shell: true,
                  cwd: resolve(__dirname, workingDirName),
                }
              );
              // execSync(`terraform state show azurerm_consumption_budget_subscription.payg_budget`, {
              //   stdio: "inherit",
              //   shell: true,
              //   cwd: resolve(__dirname, workingDirName),
              // });
            }
          }
        }
        break;
      }
      case "c02globalGroups": {
        // need Groups Administrator role to run this stage
        const subscriptionId = env.get("SUBSCRIPTION_ID");
        if (!subscriptionId) {
          throw new Error("SUBSCRIPTION_ID is not set in corp.env.");
        }
        setTfVar("subscription_id", subscriptionId);
        execSync(`terraform init`, { stdio: "pipe", shell: true, cwd: resolve(__dirname, workingDirName) });
        let rgDeployerId, leadDevId, dbAdminDevId, dbAdminTestId, dbAdminProdId;
        try {
          // process.stdout.write("Checking ResourceGroupDeployer group...");
          rgDeployerId = execSync(`az ad group show --group "ResourceGroupDeployer" --query id -o tsv`, { encoding: "utf8", stdio: "pipe" }).trim();
          // console.log("\x1b[32m" + " Found: " + rgDeployerId + "\x1b[0m");
        } catch (_) {
          rgDeployerId = null;
          // console.log("\x1b[33m" + " Not found" + "\x1b[0m");
        }
        try {
          leadDevId = execSync(`az ad group show --group "LeadDeveloper" --query id -o tsv`, { encoding: "utf8", stdio: "pipe" }).trim();
        } catch (_) {
          leadDevId = null;
        }
        try {
          dbAdminDevId = execSync(`az ad group show --group "DbAdmin-Dev" --query id -o tsv`, { encoding: "utf8", stdio: "pipe" }).trim();
        } catch (_) {
          dbAdminDevId = null;
        }
        try {
          dbAdminTestId = execSync(`az ad group show --group "DbAdmin-Test" --query id -o tsv`, { encoding: "utf8", stdio: "pipe" }).trim();
        } catch (_) {
          dbAdminTestId = null;
        }
        try {
          dbAdminProdId = execSync(`az ad group show --group "DbAdmin-Prod" --query id -o tsv`, { encoding: "utf8", stdio: "pipe" }).trim();
        } catch (_) {
          dbAdminProdId = null;
        }
        if (rgDeployerId && !tfStateList.includes("azuread_group.resource_group_deployer")) {
          console.log("Importing existing ResourceGroupDeployer group with ID:", rgDeployerId);
          execSync(`terraform import azuread_group.resource_group_deployer /groups/${rgDeployerId}`, {
            stdio: "pipe",
            shell: true,
            cwd: resolve(__dirname, workingDirName),
          });
          if (!tfStateList.includes("azurerm_role_assignment.resource_group_deployer_owner")) {
            const ownerRoleAssignmentId = execSync(
              `az role assignment list --assignee "${rgDeployerId}" --role "Owner" --scope /subscriptions/${subscriptionId} --query "[0].id" -o tsv`,
              { encoding: "utf8" }
            ).trim();
            console.log("Importing existing ResourceGroupDeployer Owner role assignment.");
            execSync(`terraform import azurerm_role_assignment.resource_group_deployer_owner ${ownerRoleAssignmentId}`, {
              stdio: "pipe",
              shell: true,
              cwd: resolve(__dirname, workingDirName),
            });
          }
        }
        if (leadDevId && !tfStateList.includes("azuread_group.lead_developer")) {
          console.log("Importing existing LeadDeveloper group with ID:", leadDevId);
          execSync(`terraform import azuread_group.lead_developer /groups/${leadDevId}`, {
            stdio: "pipe",
            shell: true,
            cwd: resolve(__dirname, workingDirName),
          });

          if (rgDeployerId && !tfStateList.includes("azuread_group_member.lead_developer_member")) {
            const isMember =
              execSync(`az ad group member check --group "ResourceGroupDeployer" --member-id ${leadDevId} --query value -o tsv`, {
                encoding: "utf8",
              }).trim() === "true";
            if (isMember) {
              console.log("Importing existing LeadDeveloper membership in ResourceGroupDeployer group.");
              execSync(`terraform import azuread_group_member.lead_developer_member "${rgDeployerId}/member/${leadDevId}"`, {
                stdio: "pipe",
                shell: true,
                cwd: resolve(__dirname, workingDirName),
              });
            }
          }
        }
        if (dbAdminDevId && !tfStateList.includes("azuread_group.db_admin_dev")) {
          console.log("Importing existing DbAdmin-Dev group with ID:", dbAdminDevId);
          execSync(`terraform import azuread_group.db_admin_dev /groups/${dbAdminDevId}`, {
            stdio: "pipe",
            shell: true,
            cwd: resolve(__dirname, workingDirName),
          });
          if (rgDeployerId && !tfStateList.includes("azuread_group_member.db_admin_dev_member")) {
            const hasMember =
              execSync(`az ad group member check --group "DbAdmin-Dev" --member-id ${rgDeployerId} --query value -o tsv`, {
                encoding: "utf8",
              }).trim() === "true";
            if (hasMember) {
              console.log("Importing existing ResourceGroupDeployer membership in DbAdmin-Dev group.");
              execSync(`terraform import azuread_group_member.db_admin_dev_member "${dbAdminDevId}/member/${rgDeployerId}"`, {
                stdio: "pipe",
                shell: true,
                cwd: resolve(__dirname, workingDirName),
              });
            }
          }
        }
        if (dbAdminTestId && !tfStateList.includes("azuread_group.db_admin_test")) {
          console.log("Importing existing DbAdmin-Test group with ID:", dbAdminTestId);
          execSync(`terraform import azuread_group.db_admin_test /groups/${dbAdminTestId}`, {
            stdio: "pipe",
            shell: true,
            cwd: resolve(__dirname, workingDirName),
          });
          if (rgDeployerId && !tfStateList.includes("azuread_group_member.db_admin_test_member")) {
            const hasMember =
              execSync(`az ad group member check --group "DbAdmin-Test" --member-id ${rgDeployerId} --query value -o tsv`, {
                encoding: "utf8",
              }).trim() === "true";
            if (hasMember) {
              console.log("Importing existing ResourceGroupDeployer membership in DbAdmin-Test group.");
              execSync(`terraform import azuread_group_member.db_admin_test_member "${dbAdminTestId}/member/${rgDeployerId}"`, {
                stdio: "pipe",
                shell: true,
                cwd: resolve(__dirname, workingDirName),
              });
            }
          }
        }
        if (dbAdminProdId && !tfStateList.includes("azuread_group.db_admin_prod")) {
          console.log("Importing existing DbAdmin-Prod group with ID:", dbAdminProdId);
          execSync(`terraform import azuread_group.db_admin_prod /groups/${dbAdminProdId}`, {
            stdio: "pipe",
            shell: true,
            cwd: resolve(__dirname, workingDirName),
          });
          if (rgDeployerId && !tfStateList.includes("azuread_group_member.db_admin_prod_member")) {
            const hasMember =
              execSync(`az ad group member check --group "DbAdmin-Prod" --member-id ${rgDeployerId} --query value -o tsv`, {
                encoding: "utf8",
              }).trim() === "true";
            if (hasMember) {
              console.log("Importing existing ResourceGroupDeployer membership in DbAdmin-Prod group.");
              execSync(`terraform import azuread_group_member.db_admin_prod_member "${dbAdminProdId}/member/${rgDeployerId}"`, {
                stdio: "pipe",
                shell: true,
                cwd: resolve(__dirname, workingDirName),
              });
            }
          }
        }
        break;
      }
      case "c05rootrg": {
        const subscriptionId = env.get("SUBSCRIPTION_ID");
        if (!subscriptionId) {
          throw new Error("SUBSCRIPTION_ID is not set in corp.env.");
        }
        const dnsName = env.get("DNS");
        if (!dnsName) {
          throw new Error("DNS is not set in corp.env.");
        }
        const accSubscriptionId = getSubscriptionId();
        if (accSubscriptionId !== subscriptionId) {
          execSync(`az account set --subscription ${subscriptionId}`, { stdio: "pipe", shell: true });
          console.log("Switching subscription to", `${corpName}-subscription`);
        }
        const location = getAzureLocation();
        const resourceGroupName = getResourceGroupName("root", corpName);
        const logAnalyticsWorkspaceName = getLogAnalyticsWorkspaceName(corpName);
        setTfVar("subscription_id", subscriptionId);
        setTfVar("dns_name", dnsName);
        setTfVar("location", location);
        setTfVar("resource_group_name", resourceGroupName);
        setTfVar("log_analytics_workspace_name", logAnalyticsWorkspaceName);
        console.log("tfStateList:", tfStateList);
        execSync(`terraform init`, { stdio: "pipe", shell: true, cwd: resolve(__dirname, workingDirName) });

        if (!tfStateList.includes("azurerm_resource_group.root_rg")) {
          let isExisting = false;
          try {
            isExisting = !!execSync(`az group show --name ${resourceGroupName} --query id -o tsv`, {
              encoding: "utf8",
              stdio: "pipe",
            }).trim();
          } catch {}
          if (isExisting) {
            console.log("Importing existing Resource Group:", resourceGroupName);
            execSync(`terraform import azurerm_resource_group.root_rg /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`, {
              stdio: "pipe",
              shell: true,
              cwd: resolve(__dirname, workingDirName),
            });
          }
        }

        if (!tfStateList.includes("azurerm_log_analytics_workspace.log_analytics_workspace")) {
          let isExisting = false;
          try {
            isExisting = !!execSync(
              `az monitor log-analytics workspace show --resource-group ${resourceGroupName} --workspace-name ${logAnalyticsWorkspaceName} --query id -o tsv`,
              {
                encoding: "utf8",
                stdio: "pipe",
              }
            ).trim();
          } catch {}
          if (isExisting) {
            console.log("Importing existing Log Analytics Workspace:", logAnalyticsWorkspaceName);
            execSync(
              `terraform import azurerm_log_analytics_workspace.log_analytics_workspace /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.OperationalInsights/workspaces/${logAnalyticsWorkspaceName}`,
              {
                stdio: "pipe",
                shell: true,
                cwd: resolve(__dirname, workingDirName),
              }
            );
          }
        }
        if (!tfStateList.includes("azurerm_monitor_diagnostic_setting.activity_log_diagnostics")) {
          const isExisting = !!execSync(
            `az monitor diagnostic-settings list --resource /subscriptions/${subscriptionId} --query "[?name=='standard-diagnostics-setting'].id" -o tsv`,
            {
              encoding: "utf8",
              stdio: "pipe",
            }
          ).trim();
          if (isExisting) {
            console.log("Importing existing Monitor Diagnostic Setting: activity_log_diagnostics");
            execSync(
              `terraform import azurerm_monitor_diagnostic_setting.activity_log_diagnostics "/subscriptions/${subscriptionId}|standard-diagnostics-setting"`,
              {
                stdio: "pipe",
                shell: true,
                cwd: resolve(__dirname, workingDirName),
              }
            );
          }
        }
        if (!tfStateList.includes("azurerm_dns_zone.dns_zone")) {
          let isExisting = false;
          try {
            isExisting = !!execSync(`az network dns zone show --resource-group ${resourceGroupName} --name ${dnsName}`, {
              encoding: "utf8",
              stdio: "pipe",
            }).trim();
          } catch {}
          if (isExisting) {
            console.log("Importing existing DNS Zone:", dnsName);
            execSync(
              `terraform import azurerm_dns_zone.dns_zone /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/dnsZones/${dnsName}`,
              {
                stdio: "pipe",
                shell: true,
                cwd: resolve(__dirname, workingDirName),
              }
            );
          }
        }
        break;
      }
      case "c11cloudfront": {
        const subscriptionId = env.get("SUBSCRIPTION_ID");
        if (!subscriptionId) {
          throw new Error("SUBSCRIPTION_ID is not set in corp.env.");
        }
        const dnsName = env.get("DNS");
        if (!dnsName) {
          throw new Error("DNS is not set in corp.env.");
        }
        const accSubscriptionId = getSubscriptionId();
        if (accSubscriptionId !== subscriptionId) {
          execSync(`az account set --subscription ${subscriptionId}`, { stdio: "pipe", shell: true });
          console.log("Switching subscription to", `${corpName}-subscription`);
        }
        const resourceGroupName = getResourceGroupName("root", corpName);
        setTfVar("subscription_id", subscriptionId);
        setTfVar("dns_name", dnsName);
        setTfVar("resource_group_name", resourceGroupName);
        // TODO: move to naming convention
        const bucketStaticWebsiteName = `${corpName}-web`;
        const bucketSpaName = `${corpName}-loginSpa`;
        const bucketStaticWebsiteSourceFolder = resolve(__dirname, workingDirName, "source", "webpage");
        const bucketSpaSourceFolder = resolve(__dirname, workingDirName, "source", "msalSpa");
        const lambdaEdgeAuthGuardRole = `${corpName}-authGuard-func-role`;
        const lambdaEdgeAuthGuardName = `${corpName}-authGuard-func`;
        const lambdaEdgeAuthGuardSourceFolder = resolve(__dirname, workingDirName, "source", "authGuardLambdaEdge");
        const cloudfrontOacStaticWebsiteName = `${corpName}-web-oac`;
        const cloudfrontOacSpaName = `${corpName}-loginSpa-oac`;
        const appRegistrationName = `${corpName}-login-app`;
        setTfVar("bucket_static_website_name", bucketStaticWebsiteName);
        setTfVar("bucket_spa_name", bucketSpaName);
        setTfVar("bucket_static_website_source_folder", bucketStaticWebsiteSourceFolder);
        setTfVar("bucket_spa_source_folder", bucketSpaSourceFolder);
        setTfVar("lambda_edge_auth_guard_role", lambdaEdgeAuthGuardRole);
        setTfVar("lambda_edge_auth_guard_name", lambdaEdgeAuthGuardName);
        setTfVar("lambda_edge_auth_guard_source_folder", lambdaEdgeAuthGuardSourceFolder);
        setTfVar("cloudfront_oac_static_website_name", cloudfrontOacStaticWebsiteName);
        setTfVar("cloudfront_oac_spa_name", cloudfrontOacSpaName);
        setTfVar("app_registration_name", appRegistrationName);

        execSync(`terraform init`, { stdio: "pipe", shell: true, cwd: resolve(__dirname, workingDirName) });

        // install dependencies and build for SPA
        // execSync(`npm install && npm run build`, { stdio: "pipe", shell: true, cwd: bucketSpaSourceFolder });
        // install dependencies for lambda@edge
        execSync(`npm install`, { stdio: "pipe", shell: true, cwd: lambdaEdgeAuthGuardSourceFolder });

        break;
      }
    }

    console.log("Starting Terraform initialization.");
    // Run terraform
    execSync(`terraform apply ${autoApprove ? " -auto-approve" : ""}`, {
      stdio: "inherit",
      shell: true,
      cwd: resolve(__dirname, workingDirName),
    });
    if (!env.get("SUBSCRIPTION_ID")) {
      const newSubscriptionId = execSync(`terraform output -raw new_subscription_id`, {
        encoding: "utf-8",
        cwd: resolve(__dirname, workingDirName),
      }).trim();
      env.add("SUBSCRIPTION_ID", newSubscriptionId);
      env.saveToFile();
    }
  } catch (error) {
    console.error(error.stack);
    process.exit(1);
  }
}

main();

export default { main };
