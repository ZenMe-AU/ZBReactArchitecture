terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.1.0"
}


provider "azurerm" {
  features {}

  subscription_id = data.terraform_remote_state.shared.outputs.subscription_id
}

# provider "azuread" {}

data "azurerm_storage_account" "main_sa" {
  name                = data.terraform_remote_state.shared.outputs.sa_name
  resource_group_name = data.terraform_remote_state.shared.outputs.rg_name
}

variable "module_env" {
  description = "The environment of the module"
  type        = string
}

variable "module_name" {
  description = "The name of the module"
  type        = string
}

variable "queue_list" {
  description = "The list of the queue"
  type        = list(string)
}
