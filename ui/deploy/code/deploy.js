/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// Script to deploy static web files to Azure Storage Account's static website hosting
// Uses Azure CLI commands; ensure Azure CLI is installed and user is logged in.

/**
 * // Deploy using default build process
 * node deploy.js
 *
 * // Deploy using a pre-built directory
 * node deploy.js --deployDir=./dist/client
 */
import fs from "fs";
import minimist from "minimist";
import { getTargetEnv } from "../../deploy/util/envSetup.cjs";
import { getAppConfigValueByKeyLabel } from "../../deploy/util/azureCli.cjs";
import { execSync, execFileSync, spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { getStorageAccountWebName, getFunctionAppName, getAppConfigName } from "../../deploy/util/namingConvention.cjs";
import { readdirSync, statSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moduleDir = resolve(__dirname, "..", "..");
const distPath = resolve(moduleDir, "dist", "client"); //setting in react-router.config.ts
const args = minimist(process.argv.slice(2));
const deployDirPath = args.deployDir ? resolve(args.deployDir) : null;

const envFile = resolve(moduleDir, "public", "env.json");

const apiDir = resolve(moduleDir, "..", "module");
let apiList = [];
if (fs.existsSync(apiDir)) {
  apiList = readdirSync(apiDir).filter((name) => {
    const fullPath = resolve(apiDir, name);
    return statSync(fullPath).isDirectory();
  });
}

async function deploy() {
  const envType = process.env.TF_VAR_env_type || "dev";
  const targetEnv = getTargetEnv();
  const accountName = getStorageAccountWebName(targetEnv);
  const appConfigName = getAppConfigName(targetEnv);
  const useShell = process.platform === "win32";

  try {
    console.log(`Start: Deploying static web to storage account`);
    console.log(`Step 1: Creating environment file: ${envFile}`);
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
    // Fetch API domains from App Config
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
        // console.error(`Failed to fetch ${module}:`, err);
        console.warn(`Warning: Failed to fetch ${module} domain from App Config.`);
      }
    });

    // Fetch Frontend custom domain host from App Config and expose to client
    try {
      const frontKey = `webEndpoint`;
      const frontHost = getAppConfigValueByKeyLabel({
        appConfigName,
        key: frontKey,
        label: envType,
      });
      if (frontHost) {
        envMap.set("FRONTEND_CUSTOM_DOMAIN_HOST", String(frontHost));
      }
    } catch (err) {
      console.warn("Warning: Failed to fetch webEndpoint from App Config.");
    }

    // writing back to envFile
    // const newEnvContent = Array.from(envMap.entries())
    //   .map(([k, v]) => `${k}=${v}`)
    //   .join("\n");
    // fs.writeFileSync(envFile, newEnvContent, "utf-8");
    const envObject = Object.fromEntries(envMap);
    const jsonContent = JSON.stringify(envObject, null, 2);

    fs.writeFileSync(envFile, jsonContent, "utf-8");

    console.log("Step 2: Building project.");
    let uploadDistPath = distPath;
    if (deployDirPath) {
      if (!fs.existsSync(deployDirPath)) {
        throw new Error(`Deploy directory does not exist: ${deployDirPath}`);
      }
      console.log(`Skipping build step. Using pre-built deploy directory: ${deployDirPath}`);
      uploadDistPath = resolve(deployDirPath);
    } else {
      execSync("pnpm install", { stdio: "inherit", cwd: moduleDir });
      execSync("pnpm run build", { stdio: "inherit", cwd: moduleDir });
      // await runCommand("pnpm install", { label: "Installing dependencies", cwd: moduleDir });
      // await runCommand("pnpm run build", { label: "Building project", cwd: moduleDir });
    }
    console.log("Step 3: Checking storage account access permissions.");
    const storageAccountID = execSync(`az storage account show --name ${accountName} --query id --output tsv`, { encoding: "utf8" }).trim();
    const principalName = execSync("az account show --query user.name --output tsv", { encoding: "utf8" }).trim();
    // console.log(`Storage Account ID: ${storageAccountID}`);
    // console.log(`Principal Name: ${principalName}`);
    const roleAssignment = execSync(
      `az role assignment list --assignee ${principalName} --include-inherited --include-groups --scope ${storageAccountID} --query "[?roleDefinitionName=='Storage Blob Data Contributor']" --output json`,
      { encoding: "utf8" }
    );
    const roleAssignmentObj = JSON.parse(roleAssignment || "[]");
    // console.log("Role Assignment:", roleAssignmentObj, typeof roleAssignmentObj);
    if (!roleAssignmentObj?.length > 0) {
      // console.error(
      //   "Failed: The current user does not have 'Storage Blob Data Contributor' role on the storage account. Please activate the role and try again."
      // );
      throw new Error("The current user does not have 'Storage Blob Data Contributor' role on the storage account. Please activate the role and try again.");
    }

    // Step 3.5: Ensure Static Website is enabled (idempotent)
    try {
      execSync(`az storage blob service-properties update --account-name ${accountName} --static-website --index-document index.html -o none`, {
        stdio: "ignore",
        shell: true,
      });
    } catch (_) {
      // Non-fatal; continue
    }

    console.log("Step 4: Ensuring container $web exists.");
    try {
      execSync(`az storage container create --name $web --account-name ${accountName} --auth-mode login -o none`, {
        stdio: "ignore",
        shell: useShell,
      });
    } catch (_) {
      // Non-fatal; proceed to delete/upload which will surface real issues if any
    }

    console.log(`Step 5: Deleting old blobs from account-name ${accountName}`);
    try {
      // execSync(`az storage blob delete-batch --account-name ${accountName} --source $web --auth-mode login`, { stdio: "inherit", shell: useShell });
      execFileSync("az", ["storage", "blob", "delete-batch", "--account-name", accountName, "--source", "$web", "--auth-mode", "login"], {
        stdio: "inherit",
        shell: useShell,
      });
    } catch (err) {
      console.warn("Warning: Failed to delete old blobs (continuing).", err?.message || String(err));
    }

    console.log("Step 6: Uploading new blobs.");
    try {
      // execSync(`az storage blob upload-batch --account-name ${accountName} -d $web -s "${distPath}" --auth-mode login`, {
      //   stdio: "inherit",
      //   shell: useShell,
      //   cwd: moduleDir,
      // });
      execFileSync("az", ["storage", "blob", "upload-batch", "--account-name", accountName, "-d", "$web", "-s", uploadDistPath, "--auth-mode", "login"], {
        stdio: "inherit",
        cwd: moduleDir,
        shell: useShell,
      });
    } catch (err) {
      // console.error("Failed to upload blobs:", err.message);
      throw new Error("Failed to upload blobs.");
    }

    console.log("End: Deployment completed successfully.");
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

deploy();

/**
 * Runs a shell command quietly, showing only start/success messages
 * unless the command fails.
 *
 * @param {string} command
 * @param {object} [options]
 * @param {string} [options.label]
 * @returns {Promise<void>}
 */
async function runCommand(command, options = {}) {
  const { label = command } = options;
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"], // isolate stdout/stderr
      cwd: options.cwd || process.cwd(),
    });

    let stdoutData = "";
    let stderrData = "";

    child.stdout.on("data", (data) => (stdoutData += data.toString()));
    child.stderr.on("data", (data) => (stderrData += data.toString()));

    child.on("error", (err) => {
      console.error(`Failed to start: ${label}`);
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) {
        // console.log(`Success: ${label}\n`);
        resolve();
      } else {
        // console.log(`Error: ${label} (code ${code})\n`);
        if (stdoutData.trim()) console.log(stdoutData);
        if (stderrData.trim()) console.error(stderrData);
        reject(new Error(`Command failed: ${label}`));
      }
    });
  });
}

// /**
//  * @param {string} command
//  * @param {object} [options]
//  * @param {string} [options.label]
//  * @returns {Promise<void>}
//  */
// async function runCommand(command, options = {}) {
//   const { label = command } = options;

//   console.log(`Start: ${label}\n`);

//   return new Promise((resolve, reject) => {
//     const child = spawn(command, {
//       shell: true,
//       stdio: ["inherit", "pipe", "pipe"],
//     });

//     let outputBuffer = "";

//     const writeAndCount = (data) => {
//       const text = data.toString();
//       // if (text.trim().startsWith(">")) return;
//       process.stdout.write(text);
//       outputBuffer += text;
//     };

//     child.stdout.on("data", writeAndCount);
//     child.stderr.on("data", writeAndCount);

//     child.on("error", (err) => {
//       console.error(`Failed to start: ${command}`);
//       reject(err);
//     });

//     child.on("close", (code) => {
//       const lineCount = (outputBuffer.match(/\n/g) || []).length + 2;
//       readline.moveCursor(process.stdout, 0, -lineCount);
//       readline.clearScreenDown(process.stdout);

//       if (code === 0) {
//         console.log(`Success: ${label}\n`);
//         resolve();
//       } else {
//         console.log(`Error: ${label} (code ${code})\n`);
//         reject(new Error(`Command failed: ${label}`));
//       }
//     });
//   });
// }
