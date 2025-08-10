const { execSync } = require("child_process");
const readline = require("readline");
const TARGET_ENV = "pickedstingray";
const MODULE_NAME = "questionV3";

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

function runTerraform() {
  process.env.TF_VAR_target_env = TARGET_ENV;
  process.env.TF_VAR_module_name = MODULE_NAME;
  process.env.TF_VAR_subscription_id = getAzureSubscriptionId();

  try {
    execSync(
      `terraform init -reconfigure\
        -backend-config="resource_group_name=${TARGET_ENV}-resources" \
        -backend-config="storage_account_name=${TARGET_ENV}sa" \
        -backend-config="container_name=tfstatefile" \
        -backend-config="key=${TARGET_ENV}/${TARGET_ENV}-${MODULE_NAME}-terraform.tfstate"`,
      { stdio: "inherit", shell: true }
    );
    console.log("Terraform initialized successfully.");

    // Run terraform plan
    execSync("terraform plan", { stdio: "inherit", shell: true });
    console.log("Terraform plan completed successfully.");

    // Prompt user for confirmation before applying changes
    console.log("You are about to run 'terraform apply'. This will make changes to your infrastructure.");
    const rl = readline.createInterface({
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

if (require.main === module) {
  runTerraform();
}

module.exports = { runTerraform };
