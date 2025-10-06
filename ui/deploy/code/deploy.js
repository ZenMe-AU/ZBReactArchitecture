// deployStatic.js
import fs from "fs";
import { getTargetEnv } from "../../../module/shared/func/deploy/util/envSetup.js";
import { getAppConfigValueByKeyLabel } from "../../../module/shared/func/deploy/util/azureCli.js";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { getStorageAccountWebName, getFunctionAppName, getAppConfigName } from "../../../module/shared/func/deploy/util/namingConvention.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moduleDir = resolve(__dirname, "..", "..");
const distPath = resolve(moduleDir, "dist", "client");

const envFile = resolve(moduleDir, "public", "env.json");
const apiList = ["profile", "quest5Tier"];

function deploy() {
  const envType = process.env.TF_VAR_env_type || "dev";
  const targetEnv = getTargetEnv();
  const accountName = getStorageAccountWebName(targetEnv);
  const appConfigName = getAppConfigName(targetEnv);

  try {
    console.log(`Building environment file: ${envFile}`);
    if (!fs.existsSync(envFile)) {
      fs.writeFileSync(envFile, "{}", "utf-8");
    }
    // read existing env file
    // const envContent = fs.readFileSync(envFile, "utf-8").trim().split("\n");
    // const envMap = new Map();
    // envContent.forEach((line) => {
    //   const [key, ...rest] = line.split("=");
    //   if (key) envMap.set(key, rest.join("="));
    // });
    const envContent = JSON.parse(fs.readFileSync(envFile, "utf-8"));
    const envMap = new Map(Object.entries(envContent));
    // fetch api domain from app config
    apiList.forEach((module) => {
      try {
        const key = `FunctionAppHost:${getFunctionAppName(targetEnv, module)}`;
        const value = getAppConfigValueByKeyLabel({
          appConfigName,
          key,
          label: envType,
        });
        envMap.set(`${module.toUpperCase()}_DOMAIN`, `https://${value}`);
      } catch (err) {
        console.error(`Failed to fetch ${module}:`, err);
      }
    });

    // writing back to envFile
    // const newEnvContent = Array.from(envMap.entries())
    //   .map(([k, v]) => `${k}=${v}`)
    //   .join("\n");
    // fs.writeFileSync(envFile, newEnvContent, "utf-8");
    const envObject = Object.fromEntries(envMap);
    const jsonContent = JSON.stringify(envObject, null, 2);

    fs.writeFileSync(envFile, jsonContent, "utf-8");
    console.log("Building project...");

    execSync("pnpm install", { stdio: "inherit", cwd: moduleDir });
    execSync("pnpm run build", { stdio: "inherit", cwd: moduleDir });

    const storageAccountID = execSync(`az storage account show --name ${accountName} --query id --output tsv`, { encoding: "utf8", }).trim();
    const principalName = execSync("az account show --query user.name --output tsv", { encoding: "utf8", }).trim();
    console.log(`Storage Account ID: ${storageAccountID}`);
    console.log(`Principal Name: ${principalName}`);
    const roleAssignment = execSync(`az role assignment list --scope ${storageAccountID} --query "[?roleDefinitionName=='Storage Blob Data Contributor' && principalName=='${principalName}']"`, { encoding: "utf8", }).trim();
    console.log("Role Assignment:", roleAssignment.toString());

    if (!roleAssignment) {
      console.error("The current user does not have 'Storage Blob Data Contributor' role on the storage account. Please activate the role and try again.");
      return;
    }
    console.log(`Deleting old blobs from account-name ${accountName}`);
    try {
      execSync(`az storage blob delete-batch --account-name ${accountName} --source "\\$web" --auth-mode login`, { stdio: "inherit", shell: true });
    } catch (err) {
      console.error("Failed to delete old blobs:", err.message);
      // Optionally, you can exit or continue based on your requirements
    }

    console.log("Uploading new blobs...");
    execSync(`az storage blob upload-batch --account-name ${accountName} -d "\\$web" -s "${distPath}" --auth-mode login`, {
      stdio: "inherit",
      shell: true,
      cwd: moduleDir,
    });

    console.log("Deployment completed successfully.");
  } catch (err) {
    console.error("Deployment failed:", err.message);
    process.exit(1);
  }
}

deploy();
