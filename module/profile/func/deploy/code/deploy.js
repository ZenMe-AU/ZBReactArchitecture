// distPath = "dist/dist.zip"
// npm install
// zip -r ${distPath} .
// az functionapp deployment source config-zip --src "${distPath}" --name "${functionAppName}" --resource-group "${resourceGroupName}"

// deploy.js
const { resolve } = require("path");
const { getTargetEnv, getModuleName } = require("@zenmechat/shared/deploy/util/envSetup.js");
const { execSync } = require("child_process");
const fs = require("fs");

function getResourceGroupName(targetEnv) {
  return `${targetEnv}-resources`;
}
function getStorageAccountName(targetEnv) {
  return `${targetEnv}pvtstor`;
}
function getFunctionAppName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-func`;
}

const moduleDir = resolve(__dirname, "..", "..", "..");
const targetEnv = getTargetEnv();
const moduleName = getModuleName(moduleDir);

const functionAppName = getFunctionAppName(targetEnv, moduleName);
const resourceGroupName = getResourceGroupName(targetEnv);
const storageAccountName = getStorageAccountName(targetEnv);
const containerName = `${functionAppName}-dist`;

const distPath = "dist/dist.zip";

const excludeList = ["dist/*", ".vscode/*", ".git/*", "local.settings.json", "local.settings.json.template", "deploy/*"];

function run(command, options = {}) {
  console.log(`▶️ Running: ${command}`);
  try {
    execSync(command, { stdio: "inherit", ...options });
  } catch (err) {
    console.error(`❌ Error executing: ${command}`);
    process.exit(1);
  }
}

function main() {
  console.log("🚀 Start deployment...");

  if (fs.existsSync("shared/package.json")) {
    console.log("📦 Installing shared module dependencies...");
    run("npm install", { cwd: resolve(moduleDir, "..", "shared", "func") });
  }

  //   run("npm install");
  run("npm install --omit=dev", { cwd: resolve(moduleDir, "func") });

  run("npm prune --production", { cwd: resolve(moduleDir, "func") });

  if (!fs.existsSync(resolve(moduleDir, "func", "dist"))) {
    fs.mkdirSync(resolve(moduleDir, "func", "dist"));
  }

  if (fs.existsSync(resolve(moduleDir, "func", distPath))) {
    fs.unlinkSync(resolve(moduleDir, "func", distPath));
  }

  const excludeArgs = excludeList.map((p) => `-x "${p}"`).join(" ");
  run(`zip -r ${distPath} . ${excludeArgs}`, { cwd: resolve(moduleDir, "func") });

  //   run(`az functionapp deployment source config-zip --src "${distPath}" --name "zenmelukefuncapp" --resource-group "zenmelukefuncapp"`, {
  //     cwd: resolve(moduleDir, "func"),
  //   });
  run(`az functionapp deployment source config-zip --src "${distPath}" --name ${functionAppName} --resource-group ${resourceGroupName}`, {
    cwd: resolve(moduleDir, "func"),
  });

  //   run(`az storage container create --name ${containerName} --account-name ${storageAccountName} --auth-mode login`, {
  //     cwd: resolve(moduleDir, "func"),
  //   });

  //     run(
  //       `az storage blob upload --container-name ${containerName} --file "${distPath}" --name dist.zip --account-name ${storageAccountName} --auth-mode login --overwrite`,
  //       { cwd: resolve(moduleDir, "func") }
  //     );
  //   const sasExpiry = "2030-01-01T00:00Z";
  //   const sasToken = execSync(
  //     `az storage blob generate-sas --account-name ${storageAccountName} --container-name ${containerName} --name dist.zip --permissions r --expiry ${sasExpiry} -o tsv`,
  //     { encoding: "utf-8" }
  //   ).trim();

  //   // Blob URL
  //   const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/dist.zip?${sasToken}`;

  //   run(`az functionapp deployment source config-zip --src "${blobUrl}" --name ${functionAppName} --resource-group ${resourceGroupName}`, {
  //     cwd: resolve(moduleDir, "func"),
  //   });

  console.log("✅ Deployment finished!");
}

main();

//   run(`az functionapp deployment source config-zip --src "${distPath}" --name "${functionAppName}" --resource-group "${resourceGroupName}"`, {
//     cwd: resolve(moduleDir, "func"),
//   });
