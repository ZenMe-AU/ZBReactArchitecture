/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

/* This script configures the corporate environment with the relevant permissions to allow automated deployments.
 */
import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
// import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { getResourceGroupName, getStorageAccountName, getAppConfigName } from "../util/namingConvention.cjs";
import { generateNewEnvName, getTargetEnv } from "../util/envSetup.cjs";
import { getSubscriptionId, getDefaultAzureLocation, isStorageAccountNameAvailable } from "../util/azureCli.cjs";
import { AzureCliCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";

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
    console.error("Failed to get Azure subscription ID. Make sure you are logged in with Azure CLI.");
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
function getTargetEnvName() {
  if (TARGET_ENV) {
    return TARGET_ENV;
  }
  const envFilePath = resolve("..", ".env");
  try {
    // Try to read existing TARGET_ENV from .env file
    TARGET_ENV = getTargetEnv();
  } catch (error) {
    const newEnvName = generateNewEnvName();
    const isAvailable = isStorageAccountNameAvailable(newEnvName);
    if (isAvailable) {
      TARGET_ENV = newEnvName;
      writeFileSync(envFilePath, `TARGET_ENV=${TARGET_ENV}\n`, { flag: "w" });
    } else {
      getTargetEnvName();
    }
  }
  return TARGET_ENV;
}

/* use graph api to activate groupname membership in entra id.
 */
const graphClient = null;
function graphActivatePimEntitlement(groupname) {
  if (!graphClient) {
    // Login to Graph
    const credential = new AzureCliCredential();
    graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
          return tokenResponse.token;
        },
      },
    });
  }

  const requestBody = {
    action: "activate",
    assignmentScheduleId: "<assignmentScheduleId>", // ID of the eligible assignment
    justification: "Need access for deployment",
    principalId: "<userObjectId>", // Current user's object ID
    targetId: "<groupObjectId>", // Target group ID
    assignmentType: "member",
    duration: "PT4H", // ISO 8601 duration format (e.g., 4 hours)
  };

  // const response = await graphClient
  //   .api("/identityGovernance/privilegedAccess/group/assignmentScheduleRequests")
  //   .post(requestBody);
  // console.log("Activation response:", response);
  // }
}

/** Activate PIM role "App Configuration Data Owner" for the current user for the current tenant.
 * This activation will usually expire within 8 hours and need to be re-activated every time it's needed.
 */
function activatePimPermissions() {
  try {
    // Get current user id from Azure CLI
    const userId = execSync("az ad signed-in-user show --query id -o tsv", { encoding: "utf8" }).trim();
    console.log(`az role assignment create --assignee ${userId} --role "App Configuration Data Owner" --scope /subscriptions/${getAzureSubscriptionId()}`);
    execSync(`az role assignment create --assignee ${userId} --role "App Configuration Data Owner" --scope /subscriptions/${getAzureSubscriptionId()}`);
  } catch (error) {
    console.error("Failed to activate PIM role:", error);
    process.exit(1);
  }
}

function main() {
  const autoApprove = process.argv.includes("--auto-approve");
  const envType = process.env.TF_VAR_env_type;
  const targetEnv = getTargetEnvName();
  process.env.TF_VAR_target_env = targetEnv;
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  process.env.TF_VAR_subscription_id = getAzureSubscriptionId();
  console.log(`Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`);
  process.env.TF_VAR_location = getAzureLocation();
  console.log(`Setting location to: ${process.env.TF_VAR_location}`);

  process.env.TF_VAR_resource_group_name = getResourceGroupName(envType, targetEnv);
  console.log(`Setting resource_group_name to: ${process.env.TF_VAR_resource_group_name}`);
  process.env.TF_VAR_storage_account_name = getStorageAccountName(targetEnv);
  console.log(`Setting storage_account_name to: ${process.env.TF_VAR_storage_account_name}`);
  process.env.TF_VAR_appconfig_name = getAppConfigName(targetEnv);
  console.log(`Setting appconfig_name to: ${process.env.TF_VAR_appconfig_name}`);

  activatePimPermissions();

  try {
    execSync(`terraform init`, { stdio: "inherit", shell: true });
    console.log("Terraform initialized successfully.");
    // Run terraform
    execSync(`terraform apply ${autoApprove ? " -auto-approve" : ""}`, { stdio: "inherit", shell: true });
  } catch (error) {
    console.error("Terraform command failed:", error);
    process.exit(1);
  }
}

main();

export default { main };

// // const dbAdminGroupName = getDbAdminName(process.env.TF_VAR_env_type); //DbAdmin-Dev, DbAdmin-Test, DbAdmin-Prod
// // const groupObjectId = getGroupObjectId(dbAdminGroupName);
// // const memberObjectId = getObjectId();
// /*
//  *  use graph api to activate groupname membership in entra id.
//  */
// let graphClient = null;
// async function graphActivatePimEntitlement(groupObjectId, memberObjectId) {
//   if (!graphClient) {
//     // Login to Graph
//     const credential = new AzureCliCredential();
//     graphClient = Client.initWithMiddleware({
//       authProvider: {
//         getAccessToken: async () => {
//           const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
//           console.log("tokenResponse", tokenResponse);
//           return tokenResponse.token;
//         },
//       },
//     });
//   }
//   console.log("graphClient", graphClient);
//   let dbAdminGroupName = "DbAdmin-Dev";
//   groupObjectId = getGroupObjectId(dbAdminGroupName);
//   memberObjectId = getObjectId();
//   console.log("groupObjectId", groupObjectId);
//   console.log("memberObjectId", memberObjectId);
//   const eligibleAssignments = await graphClient
//     .api("/identityGovernance/privilegedAccess/group/assignmentSchedules")
//     .filter(`principalId eq '${memberObjectId}' and groupId eq '${groupObjectId}'`)
//     .get();
//   console.log("eligibleAssignments", eligibleAssignments);
//   let assignmentScheduleId = null;
//   if (eligibleAssignments.value.length > 0) {
//     assignmentScheduleId = eligibleAssignments.value[0].id;
//   }
//   // let assignmentScheduleId = "8fd99b8f-f7ed-42d7-99d3-3e26f03a399d_member_1f19b6e5-b923-473c-81d3-712ea0ffbcc6";
//   console.log("assignmentScheduleId", assignmentScheduleId);
//   const requestBody = {
//     action: "activate",
//     assignmentScheduleId: assignmentScheduleId, // ID of the eligible assignment
//     justification: "Need access for deployment",
//     principalId: memberObjectId, // Current user's object ID
//     targetId: groupObjectId, // Target group ID
//     assignmentType: "member",
//     duration: "PT4H", // ISO 8601 duration format (e.g., 4 hours)
//   };
//   console.log("requestBody", requestBody);
//   const response = await graphClient.api("/identityGovernance/privilegedAccess/group/assignmentScheduleRequests").post(requestBody);
//   console.log("Activation response:", response);
// }
