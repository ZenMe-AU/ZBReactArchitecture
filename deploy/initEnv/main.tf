# This file does the absolute minimum to initialize an environment for Terraform.
# Anything that's not critical for Terraform functioning, can be moved to the deployeEnv folder instead.

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.1.0"
}
variable "target_env" {
  description = "Target environment name for deployment, this must be globally unique on Azure"
  type        = string
}
output "target_env" {
  value       = var.target_env
  description = "value of target environment"
}

variable "env_type" {
  description = "Environment type for deployment, like dev, test, prod"
  type        = string
  validation {
    condition     = contains(["dev", "test", "prod"], var.env_type)
    error_message = "env_type must be one of: dev, test, prod."
  }
}
output "env_type" {
  value       = var.env_type
  description = "value of environment type"
}

variable "subscription_id" {
  description = "Subscription ID for Azure resources"
  type        = string
}
output "subscription_id" {
  value       = var.subscription_id
  description = "value of subscription ID"
}
variable "location" {
  description = "Azure location for resources, defaults to 'australiaeast' if not set"
  type        = string
}
output "location" {
  value       = var.location
  description = "value of location"
}

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
}
output "resource_group_name" {
  value       = var.resource_group_name
  description = "value of resource group name"
}

variable "storage_account_name" {
  description = "Name of the Azure Storage Account"
  type        = string
}
output "storage_account_name" {
  value       = var.storage_account_name
  description = "value of storage account name"
}

variable "appconfig_name" {
  description = "Name of the Azure App Configuration"
  type        = string
}
output "appconfig_name" {
  value       = var.appconfig_name
  description = "value of app configuration name"
}

variable "db_admin_group_name" {
  description = "Name of the Azure AD group for DB Admins"
  type        = string

}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# Create a resource group for this environment
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

# Create Azure App Configuration
resource "azurerm_app_configuration" "appconfig" {
  name                = var.appconfig_name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "developer"
}
# Store the environment name in App Configuration. This requires "App Configuration Data Owner" role to be activated in PIM for this user at this current time.
resource "azurerm_app_configuration_key" "env_type" {
  configuration_store_id = azurerm_app_configuration.appconfig.id
  key                    = "EnvironmentName"
  value                  = var.target_env
}
# Get the Azure AD group for DB Admins
data "azuread_group" "pg_admin_group" {
  display_name = var.db_admin_group_name
}

# Store the DB Admin Group ID in App Configuration
resource "azurerm_app_configuration_key" "pg_admin_group" {
  configuration_store_id = azurerm_app_configuration.appconfig.id
  key                    = "DbAdminGroupId"
  value                  = data.azuread_group.pg_admin_group.object_id
}

# create a storage account for this environment
resource "azurerm_storage_account" "sa" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Create a storage container for Terraform state files
resource "azurerm_storage_container" "tfstatecontainer" {
  name                  = "terraformstate"
  storage_account_id    = azurerm_storage_account.sa.id
  container_access_type = "private"
}


# data "azurerm_client_config" "current" {}
# Should I create a role group for the app configuration data owner?
# resource "azurerm_role_assignment" "appconf_dataowner" {
#   scope                = azurerm_app_configuration.appconfig.id
#   role_definition_name = "App Configuration Data Owner"
#   principal_id         = data.azurerm_client_config.current.object_id
# }


#   depends_on = [
#     azurerm_role_assignment.appconf_dataowner
#   ]
# }
