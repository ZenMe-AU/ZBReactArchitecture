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

function terraformApply(autoApprove = false, planfile = "") {
  const args = autoApprove ? "-auto-approve" : "";
  execSync(`terraform apply ${args} ${planfile}`, { stdio: "inherit", shell: true });
}

function terraformImport(resource, id) {
  if (!id) return;
  if (isImported(resource)) {
    return;
  }
  execSync(`terraform import ${resource} ${id}`, { stdio: "inherit" });
}

function isImported(resource) {
  try {
    execSync(`terraform state show '${resource}'`, { stdio: "ignore" });
    console.log(`Resource already managed by Terraform: ${resource}`);
    return true;
  } catch {
    return false;
  }
}
module.exports = {
  terraformInit,
  terraformPlan,
  terraformApply,
  terraformImport,
};
