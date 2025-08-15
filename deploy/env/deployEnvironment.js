import { execSync } from "child_process";
import { createInterface } from "readline";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
// import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

let TARGET_ENV;
function getTargetEnvName() {
  if (TARGET_ENV) {
    return TARGET_ENV;
  }
  try {
    const envFilePath = resolve(__dirname, "..", ".env");
    if (existsSync(envFilePath)) {
      const envContent = readFileSync(envFilePath, "utf8");
      const match = envContent.match(/^TARGET_ENV=(.+)$/m);
      if (match && match[1]) {
        TARGET_ENV = match[1].trim();
        console.log(`Loaded TARGET_ENV from .env: ${TARGET_ENV}`);
        return TARGET_ENV;
      }
    }
    console.error("TARGET_ENV not found in ../.env. Exiting.");
  } catch (error) {
    console.error("Error reading ../.env:", error);
  }
  process.exit(1);
}

function initEnvironment() {
  process.env.TF_VAR_target_env = getTargetEnvName();
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  process.env.TF_VAR_subscription_id = getAzureSubscriptionId();
  console.log(`Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`);

  try {
    execSync(
      `terraform init -reconfigure\
        -backend-config="resource_group_name=${TARGET_ENV}-resources" \
        -backend-config="storage_account_name=${TARGET_ENV}pvtstor" \
        -backend-config="container_name=tfstatefile" \
        -backend-config="key=${TARGET_ENV}/${TARGET_ENV}-terraform.tfstate"`,
      { stdio: "inherit", shell: true }
    );
    console.log("Terraform initialized successfully.");

    // Run terraform plan
    execSync("terraform plan", { stdio: "inherit", shell: true });
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
          execSync("terraform apply -auto-approve", { stdio: "inherit", shell: true });
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
