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

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# Create a resource group for this environment
resource "azurerm_resource_group" "rg" {
  name     = "${var.target_env}-resources"
  location = var.location
}

# create a storage account for this environment
resource "azurerm_storage_account" "sa" {
  name                     = "${var.target_env}storage"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Create a storage container for Terraform state files
resource "azurerm_storage_container" "tfstatecontianer" {
  name                  = "tfstatefile"
  storage_account_id    = azurerm_storage_account.sa.id
  container_access_type = "private"
}

# Azure App Configuration
resource "azurerm_app_configuration" "appconfig" {
  name                = "${var.target_env}-appconfig"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "standard"
}

# data "azurerm_client_config" "current" {}
# // Should I create a role group for the app configuration data owner?
# resource "azurerm_role_assignment" "appconf_dataowner" {
#   scope                = azurerm_app_configuration.appconfig.id
#   role_definition_name = "App Configuration Data Owner"
#   principal_id         = data.azurerm_client_config.current.object_id
# }

# resource "azurerm_app_configuration_key" "env_type" {
#   configuration_store_id = azurerm_app_configuration.appconfig.id
#   key                    = "Environment_Name"
#   value                  = var.target_env

#   depends_on = [
#     azurerm_role_assignment.appconf_dataowner
#   ]
# }
