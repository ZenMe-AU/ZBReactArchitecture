/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
// import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import {
  getResourceGroupName,
  getStorageAccountName,
  getAppConfigName,
} from "../util/namingConvention.cjs";
import { generateNewEnvName, getTargetEnv } from "../util/envSetup.cjs";
import {
  getSubscriptionId,
  getDefaultAzureLocation,
  isStorageAccountNameAvailable,
} from "../util/azureCli.cjs";
import { AzureCliCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import minimist from "minimist";

// function getResourceGroupName(envType, targetEnv) {
//   return `${envType}-${targetEnv}`;
// }
// function getStorageAccountName(targetEnv) {
//   return `${targetEnv}`;
// }
// function getAppConfigName(targetEnv) {
//   return `${targetEnv}-appconfig`;
// }

let cachedSubscriptionId = null;
function getAzureSubscriptionId() {
  if (cachedSubscriptionId) {
    return cachedSubscriptionId;
  }
  try {
    return (cachedSubscriptionId = getSubscriptionId());
  } catch (error) {
    console.error(
      "Failed to get Azure subscription ID. Make sure you are logged in with Azure CLI.",
    );
    process.exit(1);
  }
}

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

let TARGET_ENV = null;
function getTargetEnvName(targetDir = resolve(__dirname)) {
  if (TARGET_ENV) {
    return TARGET_ENV;
  }
  try {
    // Try to read existing TARGET_ENV from .env file
    TARGET_ENV = getTargetEnv(targetDir);
  } catch (error) {
    const newEnvName = generateNewEnvName();
    const isAvailable = isStorageAccountNameAvailable(newEnvName);
    const envFilePath = resolve(targetDir, ".env");
    console.log("envFilePath:", envFilePath);
    if (isAvailable) {
      TARGET_ENV = newEnvName;
      writeFileSync(envFilePath, `TARGET_ENV=${TARGET_ENV}\n`, { flag: "w" });
    } else {
      getTargetEnvName(targetDir);
    }
  }
  return TARGET_ENV;
}

// /* use graph api to activate groupname membership in entra id.
// */
// const graphClient = null;
// function graphActivatePimEntitlement(groupname) {

// if (!graphClient) {
//   // Login to Graph
//   const credential = new AzureCliCredential();
//   graphClient = Client.initWithMiddleware({
//     authProvider: {
//       getAccessToken: async () => {
//         const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
//         return tokenResponse.token;
//       }
//     }
//   });
// }

// const requestBody = {
//   "action": "activate",
//   "assignmentScheduleId": "<assignmentScheduleId>", // ID of the eligible assignment
//   "justification": "Need access for deployment",
//   "principalId": "<userObjectId>", // Current user's object ID
//   "targetId": "<groupObjectId>",   // Target group ID
//   "assignmentType": "member",
//   "duration": "PT4H" // ISO 8601 duration format (e.g., 4 hours)
// };

// const response = await graphClient
//   .api("/identityGovernance/privilegedAccess/group/assignmentScheduleRequests")
//   .post(requestBody);
// console.log("Activation response:", response);
// }

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
      `az role assignment create --assignee ${userId} --role "App Configuration Data Owner" --scope /subscriptions/${getAzureSubscriptionId()}`,
    );
    execSync(
      `az role assignment create --assignee ${userId} --role "App Configuration Data Owner" --scope /subscriptions/${getAzureSubscriptionId()}`,
    );
  } catch (error) {
    console.error("Failed to activate PIM role:", error);
    process.exit(1);
  }
}

function initEnvironment() {
  const autoApprove = process.argv.includes("--auto-approve");
  const args = minimist(process.argv.slice(2));
  const assignDeployer = args.assignDeployer;
  const envDir = args.envDir;

  const envType = process.env.TF_VAR_env_type;
  const targetEnv = getTargetEnvName(envDir);
  process.env.TF_VAR_target_env = targetEnv;
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  const subscriptionId = getAzureSubscriptionId();
  process.env.TF_VAR_subscription_id = subscriptionId;
  console.log(
    `Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`,
  );
  process.env.TF_VAR_location = getAzureLocation();
  console.log(`Setting location to: ${process.env.TF_VAR_location}`);

  const resourceGroupName = getResourceGroupName(envType, targetEnv);
  process.env.TF_VAR_resource_group_name = resourceGroupName;
  console.log(
    `Setting resource_group_name to: ${process.env.TF_VAR_resource_group_name}`,
  );
  process.env.TF_VAR_storage_account_name = getStorageAccountName(targetEnv);
  console.log(
    `Setting storage_account_name to: ${process.env.TF_VAR_storage_account_name}`,
  );
  process.env.TF_VAR_appconfig_name = getAppConfigName(targetEnv);
  console.log(
    `Setting appconfig_name to: ${process.env.TF_VAR_appconfig_name}`,
  );

  activatePimPermissions();

  try {
    execSync(`terraform init`, { stdio: "inherit", shell: true });
    console.log("Terraform initialized successfully.");

    // Run terraform plan
    // execSync("terraform plan -out=planfile", { stdio: "inherit", shell: true });
    console.log("Terraform plan completed successfully.");

    // Prompt user for confirmation before applying changes
    console.log(
      "You are about to run 'terraform apply'. This will make changes to your infrastructure.",
    );
    if (autoApprove) {
      try {
        execSync("terraform apply -auto-approve", {
          stdio: "inherit",
          shell: true,
        });
      } catch (error) {
        console.error("Terraform apply failed:", error);
        process.exit(1);
      }
    } else {
      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(
        "Do you want to continue and run 'terraform apply'? (y/N): ",
        (answer) => {
          rl.close();
          if (answer.trim().toLowerCase() === "y") {
            try {
              execSync("terraform apply -auto-approve", {
                stdio: "inherit",
                shell: true,
              });

              // Assign roles (Contributor, App Configuration Data Owner) to deployer service principal if specified
              if (assignDeployer) {
                const spId = execSync(
                  `az ad sp list --display-name "${assignDeployer}" --query "[0].id" -o tsv`,
                  { encoding: "utf8" },
                ).trim();
                console.log(
                  `az role assignment create --assignee ${spId} --role "App Configuration Data Owner" --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
                );
                execSync(
                  `az role assignment create --assignee ${spId} --role "App Configuration Data Owner" --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
                  { stdio: "inherit" },
                );

                console.log(
                  `az role assignment create --assignee ${spId} --role "Contributor" --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
                );
                execSync(
                  `az role assignment create --assignee ${spId} --role "Contributor" --scope /subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
                  { stdio: "inherit" },
                );
              }
            } catch (error) {
              console.error("Terraform apply failed:", error);
              process.exit(1);
            }
          } else {
            console.log("Aborted terraform apply.");
          }
        },
      );
    }
  } catch (error) {
    console.error("Terraform command failed:", error);
    process.exit(1);
  }
}

initEnvironment();

export default { initEnvironment };
