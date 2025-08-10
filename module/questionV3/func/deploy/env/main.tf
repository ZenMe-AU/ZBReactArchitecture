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

data "azurerm_resource_group" "main_rg" {
  name = "${var.target_env}-resources"
}
data "azurerm_storage_account" "main_sa" {
  name                = "${var.target_env}sa"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

data "azurerm_service_plan" "main_plan" {
  name                = "${var.target_env}-plan"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# data "azurerm_app_configuration" "main_appconfig" {
#   name                = "${random_pet.env_name.id}-appconfig"
#   resource_group_name = data.azurerm_resource_group.main_rg.name
# }

# data "azurerm_app_configuration_key" "sb_namespace" {
#   configuration_store_id = data.azurerm_app_configuration.main_appconfig.id
#   key                    = "ServiceBusNamespace"
# }

# Get group for PostgreSQL admins
data "azuread_groups" "group" {
  display_names = ["LeadDeveloper"]
}
