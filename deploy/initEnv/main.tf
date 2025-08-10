terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.1.0"
}

variable "subscription_id" {
  description = "Subscription ID for Azure resources"
  type        = string
}

variable "location" {
  description = "Location for resources"
  type        = string
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}


resource "random_pet" "env_name" {
  length    = 2
  separator = ""
}


# Create a resource group for this environment
resource "azurerm_resource_group" "rg" {
  name     = "${random_pet.env_name.id}-resources"
  location = var.location
}


# create a storage account for this environment
resource "azurerm_storage_account" "sa" {
  name                     = "${random_pet.env_name.id}sa"
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
  name                = "${random_pet.env_name.id}-appconfig"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "standard"
}

