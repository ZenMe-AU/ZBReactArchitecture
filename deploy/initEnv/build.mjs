import fs from "fs";
import path from "path";
import { dirname, resolve } from "path";
import { execSync } from "child_process";
import archiver from "archiver";
import { generateNewEnvName, getTargetEnv } from "../util/envSetup.cjs";
import { isStorageAccountNameAvailable } from "../util/azureCli.cjs";
import { fileURLToPath } from "url";
import { exit } from "process";

function normalizeExcludes(excludeList) {
  return excludeList.map((e) => e.replace(/\\/g, "/"));
}

function zipDir(targetZip, cwd, excludeList = []) {
  return new Promise((resolvePromise, reject) => {
    const outputPath = path.resolve(cwd, targetZip);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => resolvePromise());
    output.on("error", (err) => reject(err));
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    const ignores = normalizeExcludes([
      ...excludeList,
      targetZip.replace(/\\/g, "/"),
    ]);
    archive.glob("**/*", {
      cwd,
      dot: true,
      ignore: ignores,
    });
    archive.finalize();
  });
}

let TARGET_ENV;
function getTargetEnvName(
  targetDir = resolve(dirname(fileURLToPath(import.meta.url)), ".."),
) {
  if (TARGET_ENV) {
    return TARGET_ENV;
  }
  try {
    // Try to read existing TARGET_ENV from .env file
    TARGET_ENV = getTargetEnv(targetDir);
  } catch (error) {
    const envFilePath = resolve(targetDir, ".env");
    const newEnvName = generateNewEnvName();
    const isAvailable = isStorageAccountNameAvailable(newEnvName);
    if (isAvailable) {
      TARGET_ENV = newEnvName;
      fs.writeFileSync(envFilePath, `TARGET_ENV=${TARGET_ENV}\n`, {
        flag: "w",
      });
    } else {
      getTargetEnvName();
    }
  }
  return TARGET_ENV;
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envFileName = ".env";
  const terraformFileName = "main.tf";
  const execFileName = "initNewEnv.ps1";
  const distDirName = "dist";
  const zipFileName = "dist.zip";
  const distDir = resolve(__dirname, distDirName);
  const zipFile = resolve(__dirname, zipFileName);
  console.log("Step 1: Building project.");
  //   execSync("pnpm install", { stdio: "inherit" });

  console.log("Step 2: Creating output.");
  if (fs.existsSync(distDir)) {
    console.log("Deleting existing output directory.");
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  execSync("pnpm run build:init", { stdio: "inherit" });

  console.log("Step 3: copy env file.");
  const targetEnv = getTargetEnvName();
  fs.copyFileSync(
    resolve(__dirname, "..", envFileName),
    resolve(distDir, envFileName),
  );

  console.log("Step 4: copy terraform file.");
  fs.copyFileSync(
    resolve(__dirname, terraformFileName),
    resolve(distDir, terraformFileName),
  );

  console.log("Step 4: copy exec file.");
  //   fs.copyFileSync(resolve(__dirname, execFileName), resolve(distDir, execFileName));
  fs.writeFileSync(
    resolve(distDir, execFileName),
    `param(
    [string]$type = "dev"
)


# If no type parameter is passed, try to read it from environment variable TF_VAR_env_type
# If still no value, or the value is not in the valid list, default to "dev"
# Set environment variable TF_VAR_env_type with the value
$validTypes = @("dev", "test", "prod")
if (-not $type) {
    $type = $env:TF_VAR_env_type
    if ($type) {
        Write-Output "type parameter not set, using TF_VAR_env_type environment variable value: $type"
    }
}
if (-not $type -or $type -notin $validTypes) {
    Write-Warning "type is not set to a valid value ($($validTypes -join ', ')). Defaulting to 'dev'."
    $type = "dev"
}
$env:TF_VAR_env_type = $type
Write-Output "TF_VAR_env_type was set to $env:TF_VAR_env_type"


Set-Location $PSScriptRoot
node ./bundle.cjs --envDir=$PSScriptRoot --auto-approve --assignOwner=github-oidc`,
    { flag: "w" },
  );

  console.log("Step 5: Zipping output directory.");
  if (fs.existsSync(zipFile)) {
    console.log("Deleting existing dist file.");
    fs.unlinkSync(zipFile);
  }
  await zipDir(zipFile, distDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
