const { createInterface } = require("readline");
const { terraformInit, terraformPlan, terraformApply } = require("./util/terraformCli");
const {
  getFunctionAppName,
  getResourceGroupName,
  getStorageAccountName,
  getAppInsightsName,
  getIdentityName,
  getDbAdminName,
  getModuleServicePlanName,
  getModuleStorageAccountContainerName,
  getPgServerName,
  getStorageAccountWebName,
} = require("./util/namingConvention");
const { getSubscriptionId } = require("./util/azureCli");

class EnvironmentDeployer {
  constructor({ envType, targetEnv, moduleName, dbName, backendConfig, logLevel = "", autoApprove = false }) {
    this.envType = envType;
    this.targetEnv = targetEnv;
    this.moduleName = moduleName;
    this.dbName = dbName || moduleName;
    this.logLevel = logLevel;
    this.autoApprove = autoApprove;

    this.subscriptionId = getSubscriptionId();
    this.functionAppName = getFunctionAppName(this.targetEnv, this.moduleName);
    this.resourceGroupName = getResourceGroupName(this.envType, this.targetEnv);
    this.storageAccountName = getStorageAccountName(this.targetEnv);
    this.appInsightsName = getAppInsightsName(this.targetEnv);
    this.identityName = getIdentityName(this.targetEnv);
    this.dbAdminName = getDbAdminName(this.targetEnv);
    this.servicePlanName = getModuleServicePlanName(this.targetEnv, this.moduleName);
    this.storageAccountContainerName = getModuleStorageAccountContainerName(this.targetEnv, this.moduleName);
    this.pgServerName = getPgServerName(this.targetEnv);
    this.storageAccountWebName = getStorageAccountWebName(this.targetEnv);

    this.backendConfig = backendConfig || {
      resource_group_name: this.resourceGroupName,
      storage_account_name: this.storageAccountName,
      container_name: "tfstatefile",
      key: `${this.targetEnv}/${this.targetEnv}-${this.moduleName}-terraform.tfstate`,
    };
  }

  run() {
    process.env.TF_VAR_target_env = this.targetEnv;
    process.env.TF_VAR_module_name = this.moduleName;
    process.env.TF_VAR_subscription_id = this.subscriptionId;
    process.env.TF_VAR_db_name = this.dbName;
    process.env.TF_LOG = this.logLevel;

    process.env.TF_VAR_function_app_name = this.functionAppName;
    process.env.TF_VAR_resource_group_name = this.resourceGroupName;
    process.env.TF_VAR_storage_account_name = this.storageAccountName;
    process.env.TF_VAR_app_insights_name = this.appInsightsName;
    process.env.TF_VAR_identity_name = this.identityName;
    process.env.TF_VAR_db_admin_name = this.dbAdminName;
    process.env.TF_VAR_service_plan_name = this.servicePlanName;
    process.env.TF_VAR_storage_account_container_name = this.storageAccountContainerName;
    process.env.TF_VAR_pg_server_name = this.pgServerName;
    process.env.TF_VAR_storage_account_web_name = this.storageAccountWebName;

    terraformInit({ backendConfig: this.backendConfig });
    terraformPlan();

    if (this.autoApprove) {
      terraformApply();
    } else {
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
}

module.exports = EnvironmentDeployer;
