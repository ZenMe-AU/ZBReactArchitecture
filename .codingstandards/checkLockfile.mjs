/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { execSync } from "child_process";

const installCommand = "pnpm install --frozen-lockfile";

function runFrozenInstall() {
  execSync(installCommand, { stdio: "inherit" });
}

function getErrorText(error) {
  const stderr = error?.stderr ? String(error.stderr) : "";
  const stdout = error?.stdout ? String(error.stdout) : "";
  const message = error?.message ? String(error.message) : "";
  return [message, stderr, stdout].filter(Boolean).join("\n");
}

function toSingleQuotedPowerShellPath(path) {
  return `'${String(path).replace(/'/g, "''")}'`;
}

try {
  runFrozenInstall();
} catch (error) {
  const errorText = getErrorText(error);
  const isEnotempty = /ERR_PNPM_ENOTEMPTY|ENOTEMPTY/i.test(errorText);

  if (isEnotempty) {
    const match = errorText.match(/rmdir '([^']+)'/i);
    const cleanupPath = match?.[1];
    console.error(" PNPM ENOTEMPTY detected. This usually means that a node_modules folder is not empty when it should be.");
    if (cleanupPath) {
      console.error(` Manually delete the following path: ${cleanupPath}`);
      console.error(` PowerShell cleanup command: Remove-Item -LiteralPath ${toSingleQuotedPowerShellPath(cleanupPath)} -Recurse -Force`);
    }
    console.error(" Re-run commit after manual cleanup.");
    process.exit(1);
  }

  console.error(" Lockfile out of sync. Run pnpm install and commit again.", error);
  process.exit(1);
}
