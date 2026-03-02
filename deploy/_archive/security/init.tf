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

# Parent DNS settings
variable "parent_domain_name" {
  description = "Parent domain name (e.g., zenblox.com.au) for custom domains"
  type        = string
  default     = "zenblox.com.au"
}

variable "dns_resource_group_name" {
  description = "Resource group name that contains the DNS zone"
  type        = string
  default     = "root-zenblox"
}

variable "target_env" {
  description = "Target environment name for deployment, this must be globally unique on Azure"
  type        = string
  default     = "shortpigeon"
}

variable "resource_group_name" {
  description = "Resource group name for deployment"
  type        = string
  default     = "dev-shortpigeon"
}

variable "storage_account_web_name" {
  description = "Storage account name for static website"
  type        = string
  default     = "shortpigeonweb"
}

variable "subscription_id" {
  description = "Subscription ID for Azure resources"
  type        = string
  default     = "0930d9a7-2369-4a2d-a0b6-5805ef505868"
}

variable "appconfig_name" {
  description = "App Configuration name"
  type        = string
  default     = "enviouseel-appconfig"
}


data "azurerm_resource_group" "main_resource" {
  name = var.resource_group_name
}

data "azurerm_app_configuration" "main_appconfig" {
  name                = var.appconfig_name
  resource_group_name = var.resource_group_name
}

# Get the Azure client configuration for tenant ID
data "azurerm_client_config" "current" {}
