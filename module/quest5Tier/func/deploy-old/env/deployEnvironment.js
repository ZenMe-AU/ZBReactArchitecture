const { execSync } = require("child_process");
const { createInterface } = require("readline");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const { dirname, basename, resolve } = require("path");

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
    const envFilePath = resolve(__dirname, "..", "..", "..", "..", "..", "deploy", ".env");
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

let MODULE_NAME;
function getModuleName() {
  if (MODULE_NAME) {
    return MODULE_NAME;
  }
  try {
    // Get the module folder name (the parent directory of this file)
    const moduleDirPath = resolve(__dirname, "..", "..", "..");
    MODULE_NAME = basename(moduleDirPath);
    if (MODULE_NAME) {
      console.log(`Loaded MODULE_NAME from folder: ${MODULE_NAME}`);
      return MODULE_NAME;
    }
    console.error("Failed to Load MODULE_NAME from folder.");
  } catch (error) {
    console.error("Error determining MODULE_NAME from folder:", error);
  }
  process.exit(1);
}

function initEnvironment() {
  process.env.TF_VAR_target_env = getTargetEnvName();
  console.log(`Setting TARGET_ENV to: ${process.env.TF_VAR_target_env}`);
  process.env.TF_VAR_subscription_id = getAzureSubscriptionId();
  console.log(`Setting subscription_id to: ${process.env.TF_VAR_subscription_id}`);
  process.env.TF_VAR_module_name = getModuleName();
  console.log(`Setting module_name to: ${process.env.TF_VAR_module_name}`);

  //process.env.TF_LOG = "DEBUG";
  //console.log(`Setting TF_LOG to: ${process.env.TF_LOG}`);

  try {
    execSync(
      `terraform init -reconfigure\
        -backend-config="resource_group_name=${TARGET_ENV}-resources" \
        -backend-config="storage_account_name=${TARGET_ENV}pvtstor" \
        -backend-config="container_name=tfstatefile" \
        -backend-config="key=${TARGET_ENV}/${TARGET_ENV}=${MODULE_NAME}-terraform.tfstate"`,
      { stdio: "inherit", shell: true }
    );
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
          // process.env.TF_LOG = "DEBUG";
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

  // // apply the database security
  // rl.question("Do you want to continue and run 'terraform apply'? (y/N): ", (answer) => {
  //   rl.close();
  //   // TODO:call the database security script
  // });
}
if (require.main === module) {
  initEnvironment();
}

module.exports = { initEnvironment };

// az functionapp show --name stripedfrog-quest5Tier-func --resource-group stripedfrog-resources --query "identity.principalId" -o tsv
