# Deployment Automation

The system uses deployment scripts in conjunction with infrastructure as code to enable consistent deployment of the infrastructure as well as the application components

## Layered Infrastructure as Code

The deployment scripts are structured in layers to take best advantage of relevant scripting languages and enable flexibility for use in CI/CD pipelines, manual deployments, as well as local developer environments.

1. **Orchestration:**
   This stage uses PowerShell to coordinate the deployment steps.
2. **Preparation:**
   This stage uses JavaScript to prepare the environment and perform any complex calculations required for the next stage.
3. **Application:**
   This stage uses Terraform or other required infrastructure as code library to deploy to the relevant backend environment.

## Prerequisites

For the deployment scripts to work, certain prerequisites of the environment must be met.

Azure subscription
EntraID user

The infrastructure deployment is automated using PowerShell (`deploy.ps1`) and Terraform scripts. The sequence follows these steps:

1. **Environment Preparation**
   - The PowerShell script initializes environment variables and configuration settings required for deployment (e.g., subscription, resource group, region).

2. **Terraform Initialization**
   - The script runs `terraform init` to set up the Terraform working directory and download required providers.

3. **Terraform Plan**
   - Executes `terraform plan` to preview infrastructure changes and validate the configuration.

4. **Terraform Apply**
   - Runs `terraform apply` to provision Azure resources, including:
     - Resource Group
     - Storage Account
     - Azure Service Bus
     - Application Insights
     - Cosmos DB or SQL Database (as required by modules)
     - Azure Functions and Static Web Apps

5. **Deployment of Application Code**
   - After infrastructure is provisioned, the script deploys application code:
     - Frontend (React/Vite) is built and deployed to Azure Static Web Apps.
     - Backend APIs and Azure Functions are published to their respective Azure resources.

6. **Configuration and Secrets**
   - The script configures connection strings, secrets, and environment variables for each module, ensuring secure integration between services.

7. **Verification and Output**
   - Outputs resource endpoints and connection details.
   - Verifies successful deployment by checking resource health/status.

This sequence ensures consistent, repeatable, and secure deployment of the full stack application and its supporting infrastructure.
