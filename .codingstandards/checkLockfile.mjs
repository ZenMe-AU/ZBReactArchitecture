/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { execSync } from "child_process";

try {
  execSync("pnpm install --frozen-lockfile", { stdio: "inherit" });
  //   throw new Error("something went wrong");
} catch {
  console.error(" Lockfile out of sync. Run pnpm install and commit again.");
  process.exit(1);
}
