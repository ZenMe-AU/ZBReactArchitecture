terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.0"
    }
  }
  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

provider "azuread" {}

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

variable "plan_os" {
  description = "Operating system type for the plan"
  type        = string
}

data "azurerm_resource_group" "rg" {
  name = "${var.target_env}-resources"
}

# create a storage account for this environment
data "azurerm_storage_account" "sa" {
  name                = "${var.target_env}storage"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Azure App Configuration
data "azurerm_app_configuration" "appconfig" {
  name                = "${var.target_env}-appconfig"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Get the Azure client configuration for tenant ID
data "azurerm_client_config" "current" {}
output "tenant_id" {
  value = data.azurerm_client_config.current.tenant_id
}
