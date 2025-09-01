terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.1.0"

  backend "azurerm" {}
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# The target environment will automatically load from the environment variable TF_VAR_target_env
variable "target_env" {
  description = "The target environment for the module"
  type        = string
}

# The module name will automatically load from the environment variable TF_VAR_module_name
variable "module_name" {
  description = "The name of the module"
  type        = string
}

variable "subscription_id" {
  description = "The subscription ID for Azure resources"
  type        = string
}

variable "function_app_name" {
  description = "The name of the function app"
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "storage_account_name" {
  description = "The name of the storage account"
  type        = string
}

variable "app_insights_name" {
  description = "The name of the application insights"
  type        = string
}

variable "identity_name" {
  description = "The name of the user assigned identity"
  type        = string
}

variable "service_plan_name" {
  description = "The name of the service plan"
  type        = string
}

variable "storage_account_container_name" {
  description = "The name of the storage account container"
  type        = string
}

variable "pg_server_name" {
  description = "The name of the postgreSQL server"
  type        = string
}

variable "db_name" {
  description = "The name of the database"
  type        = string
}

variable "appconfig_name" {
  description = "The name of the app configuration"
  type        = string
}

variable "env_type" {
  type = string
}
