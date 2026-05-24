/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import archiver from "archiver";

function npmInstall(cwd, options = "") {
  execSync(`npm install ${options}`, { stdio: "inherit", cwd });
}

function npmPrune(cwd) {
  execSync(`npm prune --production`, { stdio: "inherit", cwd });
}

// Normalize exclude patterns for archiver ignore globs
function normalizeExcludes(excludeList = []) {
  return excludeList
    .filter(Boolean)
    .map((p) => p.replace(/^\"|\"$/g, ""))
    .map((p) => (p.endsWith("/*") ? p.replace("/*", "/**") : p));
}

// Create a zip of cwd into targetZip. If system 'zip' is available, use it; otherwise fallback to Node 'archiver'.
function zipDir(targetZip, cwd, excludeList = []) {
  // Fallback: use archiver for cross-platform support (Windows, etc.)
  return new Promise((resolve, reject) => {
    const outputPath = path.resolve(cwd, targetZip);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    output.on("error", (err) => reject(err));
    archive.on("error", (err) => reject(err));

    archive.pipe(output);

    const ignores = normalizeExcludes([
      ...excludeList,
      targetZip.replace(/\\/g, "/"), // ensure we don't re-include the zip
    ]);

    archive.glob("**/*", {
      cwd,
      dot: true,
      ignore: ignores,
    });

    archive.finalize();
  });
}

export default {
  npmInstall,
  npmPrune,
  zipDir,
};
