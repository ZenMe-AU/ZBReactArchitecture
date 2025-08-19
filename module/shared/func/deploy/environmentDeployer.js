const { createInterface } = require("readline");
const { terraformInit, terraformPlan, terraformApply } = require("./util/terraformCli");

class EnvironmentDeployer {
  constructor({ targetEnv, moduleName, subscriptionId, backendConfig, logLevel = "" }) {
    this.targetEnv = targetEnv;
    this.moduleName = moduleName;
    this.subscriptionId = subscriptionId;
    this.logLevel = logLevel;
    this.backendConfig = backendConfig || {
      resource_group_name: `${this.targetEnv}-resources`,
      storage_account_name: `${this.targetEnv}pvtstor`,
      container_name: "tfstatefile",
      key: `${this.targetEnv}/${this.targetEnv}=${this.moduleName}-terraform.tfstate`,
    };
  }

  run() {
    process.env.TF_VAR_target_env = this.targetEnv;
    process.env.TF_VAR_module_name = this.moduleName;
    process.env.TF_VAR_subscription_id = this.subscriptionId;
    process.env.TF_LOG = this.logLevel;

    terraformInit({ backendConfig: this.backendConfig });
    terraformPlan();

    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Do you want to run terraform apply? (y/N): ", (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === "y") {
        terraformApply();
      } else {
        console.log("Aborted.");
      }
    });
  }
}

module.exports = EnvironmentDeployer;
