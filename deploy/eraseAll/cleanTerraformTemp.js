#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Resolve repo root relative to this script's location (deploy/eraseAll)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const startDir = path.resolve(__dirname, "..", "..");

console.log(`Starting cleaning Terraform temp files via PowerShell at base: ${startDir}`);

const psScript = path.resolve(__dirname, "cleanTerraformTempfiles.ps1");
if (!fs.existsSync(psScript)) {
  console.error(`PowerShell cleaner not found: ${psScript}`);
  process.exit(1);
}

try {
  console.log(`Invoking PowerShell cleaner: ${psScript}`);
  execSync(`powershell -ExecutionPolicy Bypass -File "${psScript}"`, {
    stdio: "inherit",
    cwd: startDir,
    shell: true,
  });
  console.log("PowerShell cleanup completed.");
  console.log("Done!");
} catch (err) {
  console.error(`PowerShell cleanup failed: ${err?.message ?? err}`);
  process.exit(1);
}
