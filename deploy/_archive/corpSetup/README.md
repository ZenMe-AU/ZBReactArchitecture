# Corporate Environment Deployment Automation

This script (`initCorpEnvDeploy.js`) automates the setup and management of a corporate Azure environment using Terraform and Azure CLI. It supports multi-stage deployment, resource import, and environment variable management for repeatable, auditable infrastructure provisioning.

## Prerequisites

- Node.js 20+
- Terraform CLI
- Azure CLI (logged in with sufficient permissions)
- The `corp.env` file in the same directory, containing at least the `NAME` key (corporate name)
- All referenced Terraform directories (e.g., `c01subscription`, `c02globalGroups`, `c05rootrg`) must exist and contain valid Terraform code

## How to Run

1. **Install dependencies**

   ```sh
   pnpm install
   ```

2. **Prepare your environment:**
   - Ensure `corp.env` is present and contains required keys (e.g., `NAME`, `DNS`, `SUBSCRIPTION_ID` as needed).
   - Log in to Azure CLI: `az login`

3. **Run the script for a specific stage:**

   ```sh
   node initCorpEnvDeploy.js --stage c01
   ```

   Replace `c01` with the stage you want to run (e.g., `c01`, `c02`, `c05`).

4. **Auto-approve Terraform apply (optional):**
   ```sh
   node initCorpEnvDeploy.js --stage c01 --auto-approve
   ```

## Stages Overview

- ### c01subscription (`--stage c01`)
  - **Purpose:**
    - Creates or imports an Azure subscription for the corporate environment.
    - Sets a monthly budget and notification emails.
  - **Required `corp.env` parameters:**
    - NAME
  - **Required variables in `variables.tf` (must be set before running this stage):**
    - billing_account_name
    - billing_profile_name
    - invoice_section_name
    - contact_emails
  - **Actions:**
    - Sets Terraform variables for subscription name, ID, and contact emails.
    - Initializes Terraform and imports existing subscription/budget if found.
    - Applies Terraform to create or update the subscription and budget.
    - Updates `corp.env` with the new subscription ID if created.

- ### c02globalGroups (`--stage c02`)
  - **Purpose:**
    - Manages Azure AD groups for deployment roles (e.g., ResourceGroupDeployer, LeadDeveloper, DbAdmin-Dev/Test/Prod).
  - **Required `corp.env` parameters:**
    - NAME
    - SUBSCRIPTION_ID
  - **Actions:**
    - Imports existing groups and role assignments if present.
    - Ensures group memberships and role assignments are tracked in Terraform state.

- ### c05rootrg (`--stage c05`)
  - **Purpose:**
    - Sets up the root resource group, DNS zone, Log Analytics workspace, and diagnostic settings.
  - **Required `corp.env` parameters:**
    - NAME
    - SUBSCRIPTION_ID
    - DNS
  - **Actions:**
    - Imports existing resources if present (resource group, log analytics, DNS zone, diagnostics).
    - Applies Terraform to create or update these resources.

## Environment Variable Management

- The script loads and updates `corp.env` for environment state.
- Adds or updates keys such as `SUBSCRIPTION_ID` as resources are created.

## Error Handling

- The script will exit with an error message if required environment variables or files are missing, or if any command fails.

## Notes

- Each stage is mapped to a subdirectory (e.g., `c01subscription`) containing the relevant Terraform code.
- The script is idempotent: it will import existing resources into Terraform state if they already exist in Azure.
- You can customize contact emails and other variables by editing `corp.env` or passing them as Terraform variables.

---

For more details, review the code and comments in `initCorpEnvDeploy.js` and the Terraform files in each stage directory.
