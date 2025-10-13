#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { glob } from "glob";

const startDir = path.join(process.cwd(), "..");
const targetDirs = ["deploy", "module/*/func/deploy", "ui/deploy"];
const skipDirs = [".terraform", "node_modules", ".git", "dist"];
const deleteFiles = [".terraform.lock.hcl", "terraform.tfstate.backup", "planfile", "terraform.tfstate", ".env"];

function cleanDir(targetDir) {
  if (!fs.existsSync(targetDir)) return;
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isFile() && deleteFiles.includes(entry.name)) {
      fs.unlinkSync(fullPath);
      console.log(`Removed file: ${fullPath}`);
    } else if (entry.isDirectory() && deleteFiles.includes(entry.name)) {
      removeRecursive(fullPath);
    } else if (entry.isDirectory()) {
      if (skipDirs.includes(entry.name)) {
        console.log(`Skip directory: ${entry.name}`);
        continue;
      }
      cleanDir(fullPath);
    }
  }
}

function removeRecursive(targetPath) {
  if (fs.existsSync(targetPath)) {
    if (fs.lstatSync(targetPath).isDirectory()) {
      fs.readdirSync(targetPath).forEach((entry) => {
        const curPath = path.join(targetPath, entry);
        removeRecursive(curPath);
      });
      fs.rmdirSync(targetPath);
      console.log(`Removed directory: ${targetPath}`);
    } else {
      fs.unlinkSync(targetPath);
      console.log(`Removed file: ${targetPath}`);
    }
  }
}

function cleanTerraformTemp(baseDir) {
  targetDirs.forEach((pattern) => {
    const resolvedPattern = path.join(baseDir, pattern);
    const dirs = glob.sync(resolvedPattern, { nodir: false });
    dirs.forEach((dir) => cleanDir(dir));
  });
}

console.log(`Starting cleaning Terraform temp files...`);
cleanTerraformTemp(startDir);
console.log("Done!");
