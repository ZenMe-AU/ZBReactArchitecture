const { execSync } = require("child_process");

function terraformInit({ backendConfig = {} }) {
  if (!backendConfig || Object.keys(backendConfig).length === 0) {
    console.warn("No backendConfig provided. Terraform will init with default backend settings.");
  }

  const args = Object.entries(backendConfig)
    .map(([k, v]) => `-backend-config="${k}=${v}"`)
    .join(" ");

  execSync(`terraform init -reconfigure ${args}`, { stdio: "inherit", shell: true });
}

function terraformPlan() {
  execSync("terraform plan -out=planfile", { stdio: "inherit", shell: true });
}

function terraformApply() {
  execSync("terraform apply -auto-approve planfile", { stdio: "inherit", shell: true });
}

module.exports = { terraformInit, terraformPlan, terraformApply };
