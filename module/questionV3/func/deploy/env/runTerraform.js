const { execSync } = require("child_process");
const TARGET_ENV = "pickedstingray";
const MODULE_NAME = "questionV3";
const SUBSCRIPTION_ID = "0930d9a7-2369-4a2d-a0b6-5805ef505868";

function runTerraform() {
  process.env.TF_VAR_target_env = TARGET_ENV;
  process.env.TF_VAR_module_name = MODULE_NAME;
  process.env.TF_VAR_subscription_id = SUBSCRIPTION_ID;

  try {
    execSync(
      `terraform init \
        -backend-config="resource_group_name=zenmefunctionapp1" \
        -backend-config="storage_account_name=zenmefunctionapp1" \
        -backend-config="container_name=tfstatefile" \
        -backend-config="key=dev/${MODULE_NAME}/terraform.tfstate"`,
      { stdio: "inherit", shell: true }
    );

    execSync("terraform plan", { stdio: "inherit", shell: true });
  } catch (error) {
    console.error("Terraform command failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runTerraform();
}

module.exports = { runTerraform };
