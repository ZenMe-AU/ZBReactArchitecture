const { existsSync, readFileSync } = require("fs");
const { resolve, basename } = require("path");
const { execSync } = require("child_process");
const { uniqueNamesGenerator, adjectives, animals } = require("unique-names-generator");

function getTargetEnv(rootDir = resolve(__dirname, "..", "..", "..", "..", "..")) {
  const envFilePath = resolve(rootDir, "deploy", ".env");
  if (!existsSync(envFilePath)) {
    throw new Error(".env file not found at " + envFilePath);
  }

  const envContent = readFileSync(envFilePath, "utf8");
  const match = envContent.match(/^TARGET_ENV=(.+)$/m);
  if (!match) {
    throw new Error("TARGET_ENV not found in .env file.");
  }

  return match[1].trim();
}

function getModuleName(moduleDir = resolve(process.cwd(), "..", "..", "..")) {
  const moduleEnvFilePath = resolve(moduleDir, "deploy", ".env");
  if (existsSync(moduleEnvFilePath)) {
    const envContent = readFileSync(moduleEnvFilePath, "utf8");
    const match = envContent.match(/^MODULE_NAME=(.+)$/m);
    if (match) return match[1].trim();
  }

  return basename(moduleDir);
}

function generateNewEnvName(maxLength = 20) {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: "",
    style: "lowerCase",
    length: 2,
    maxLength, // storage account name limit is 3-24 chars, allow suffix of 4 chars
  });
}

function getCurrentPublicIP() {
  try {
    return execSync("curl -s https://api.ipify.org").toString().trim();
  } catch (error) {
    console.error("Failed to get current public IP:", error.message);
    throw new Error("Could not retrieve public IP address.");
  }
}

module.exports = { getTargetEnv, getModuleName, generateNewEnvName, getCurrentPublicIP };
