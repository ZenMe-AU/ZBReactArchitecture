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

variable "env_type" {
  description = "Environment type for deployment, like dev, test, prod"
  type        = string
  validation {
    condition     = contains(["dev", "test", "prod"], var.env_type)
    error_message = "env_type must be one of: dev, test, prod."
  }
}

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

variable "appconfig_name" {
  description = "App Configuration name"
  type        = string
}

variable "parent_domain_name" {
  description = "Parent domain name for the custom domain"
  type        = string
  default     = "zenblox.com.au"
}

variable "dns_resource_group_name" {
  description = "Resource group name where the DNS zone is located"
  type        = string
  default     = "root-zenblox"
}

data "azurerm_resource_group" "main_resource" {
  name = var.resource_group_name
}

data "azurerm_resource_group" "dns_resource" {
  name = var.dns_resource_group_name
}

data "azurerm_app_configuration" "main_appconfig" {
  name                = var.appconfig_name
  resource_group_name = var.resource_group_name
}

# Get the Azure client configuration for tenant ID
data "azurerm_client_config" "current" {}
