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

variable "resource_group_name" {
  description = "Resource group name for deployment"
  type        = string
}

variable "storage_account_web_name" {
  description = "Storage account name for static website"
  type        = string
}

variable "subscription_id" {
  description = "Subscription ID for Azure resources"
  type        = string
}

data "azurerm_resource_group" "main_resource" {
  name = var.resource_group_name
}

# Get the Azure client configuration for tenant ID
data "azurerm_client_config" "current" {}
