/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// check-mit-license-header.js test
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// Read LICENSE file
const licensePath = path.resolve(__dirname, "LICENSE");
const licenseText = fs
  .readFileSync(licensePath, "utf8")
  .replace(/\r?\n/g, "\n")
  .trim();

// Get staged files
const stagedFiles = execSync("git diff --cached --name-only", {
  encoding: "utf8",
})
  .split("\n")
  .filter((f) => f && fs.existsSync(f) && fs.statSync(f).isFile());

// File extensions to check
const exts = [".js", ".ts", ".jsx", ".tsx", ".py", ".sh", ".ps1"];

let failed = [];
for (const file of stagedFiles) {
  if (!exts.includes(path.extname(file))) continue;
  const content = fs.readFileSync(file, "utf8").replace(/\r?\n/g, "\n").trim();
  if (!content.startsWith(licenseText)) {
    failed.push(file);
  }
}

if (failed.length) {
  console.error("MIT license header missing in files:");
  failed.forEach((f) => console.error("  " + f));
  process.exit(1);
}
