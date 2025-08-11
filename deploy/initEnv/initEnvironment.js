import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

let cachedSubscriptionId = null;
function getAzureSubscriptionId() {
  if (cachedSubscriptionId) {
    return cachedSubscriptionId;
  }
  try {
    const output = execSync("az account show --query id -o tsv", { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
    cachedSubscriptionId = output.trim();
    return cachedSubscriptionId;
  } catch (error) {
    console.error("Failed to get Azure subscription ID. Make sure you are logged in with Azure CLI.");
    process.exit(1);
  }
}

let azureLocation = null;
function getAzureLocation() {
  if (azureLocation) {
    return azureLocation;
  }
  let tmpazureLocation = null;
  try {
    tmpazureLocation = execSync('az account list-locations --query "[?isDefault].name" -o tsv', { encoding: "utf8" }).trim();
  } catch (error) {
    console.error("Failed to get Azure location.");
  }
  if (tmpazureLocation && tmpazureLocation.length > 0) {
    azureLocation = tmpazureLocation;
  } else {
    azureLocation = "australiaeast"; // Default fallback location
    console.warn(`Using fallback Azure location: ${azureLocation}`);
  }
  return azureLocation;
}

let TARGET_ENV = null;
function getTargetEnvName() {
  if (TARGET_ENV) {
    return TARGET_ENV;
  }
  const envFilePath = resolve("..", ".env");
  if (existsSync(envFilePath)) {
    const envContent = readFileSync(envFilePath, "utf8");
    const match = envContent.match(/^TARGET_ENV=(.+)$/m);
    if (match && match[1]) {
      TARGET_ENV = match[1].trim();
      console.log(`Loaded TARGET_ENV from .env: ${TARGET_ENV}`);
      return TARGET_ENV;
    }
  }
  if (!TARGET_ENV) {
    TARGET_ENV = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: "",
      style: "lowerCase",
      length: 2,
    }); //+ `-${Math.floor(Math.random() * 10000)}`
    writeFileSync(envFilePath, `TARGET_ENV=${TARGET_ENV}\n`, { flag: "w" });
    console.log(`Generated TARGET_ENV: ${TARGET_ENV} and saved to .env`);
  }
  return TARGET_ENV;
}

function initEnvironment() {
  process.env.TF_VAR_target_env = getTargetEnvName();
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  process.env.TF_VAR_subscription_id = getAzureSubscriptionId();
  console.log(`Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`);
  process.env.TF_VAR_location = getAzureLocation();
  console.log(`Setting location to: ${process.env.TF_VAR_location}`);

  try {
    execSync(`terraform init`, { stdio: "inherit", shell: true });
    console.log("Terraform initialized successfully.");

    // Run terraform plan
    execSync("terraform plan -out=planfile", { stdio: "inherit", shell: true });
    console.log("Terraform plan completed successfully.");

    // Prompt user for confirmation before applying changes
    console.log("You are about to run 'terraform apply'. This will make changes to your infrastructure.");
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Do you want to continue and run 'terraform apply'? (y/N): ", (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === "y") {
        try {
          execSync("terraform apply -auto-approve planfile", { stdio: "inherit", shell: true });
        } catch (error) {
          console.error("Terraform apply failed:", error);
          process.exit(1);
        }
      } else {
        console.log("Aborted terraform apply.");
      }
    });
  } catch (error) {
    console.error("Terraform command failed:", error);
    process.exit(1);
  }
}

initEnvironment();

export default { initEnvironment };
