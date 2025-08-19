// deployStatic.js
import { getTargetEnv } from "../../../module/shared/func/deploy/util/envSetup.js";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getStorageAccountName(targetEnv) {
  return `${targetEnv}website`;
}

const moduleDir = resolve(__dirname, "..", "..");
const distPath = resolve(moduleDir, "build", "client");

function deploy() {
  const targetEnv = getTargetEnv();
  const accountName = getStorageAccountName(targetEnv);

  try {
    console.log("Building project...");
    execSync("pnpm install", { stdio: "inherit", cwd: moduleDir });
    execSync("pnpm run build", { stdio: "inherit", cwd: moduleDir });

    console.log("Deleting old blobs...");
    execSync(`az storage blob delete-batch --account-name ${accountName} --source "\\$web"`, { stdio: "inherit", shell: true });

    console.log("Uploading new blobs...");
    execSync(`az storage blob upload-batch --account-name ${accountName} -d "\\$web" -s ${distPath}`, {
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
