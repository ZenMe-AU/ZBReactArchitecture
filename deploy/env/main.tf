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

variable "subscription_id" {
  description = "Subscription ID for Azure resources"
  type        = string
}

variable "location" {
  description = "Location for resources"
  type        = string
}

variable "plan_os" {
  description = "Operating system type for the plan"
  type        = string
}

variable "group_name" {
  description = "Name of the Azure AD group"
  type        = string
}

resource "random_pet" "env_name" {
  length    = 2
  separator = ""
}

# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${random_pet.env_name.id}-resources"
  location = var.location
}
# Azure App Configuration
resource "azurerm_app_configuration" "appconfig" {
  name                = "${random_pet.env_name.id}-appconfig"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "standard"
}
resource "azurerm_app_configuration_key" "env_type" {
  configuration_store_id = azurerm_app_configuration.appconfig.id
  key                    = "EnvironmentType"
  value                  = "Development"
  label                  = "dev"
}

# Storage Account
resource "azurerm_storage_account" "sa" {
  name                     = "${random_pet.env_name.id}sa"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# App Service Plan
resource "azurerm_service_plan" "plan" {
  name                = "${random_pet.env_name.id}-plan"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = var.plan_os
  sku_name            = "Y1" # Consumption
}

# Service bus namespace
resource "azurerm_servicebus_namespace" "sb_namespace" {
  name                = "${random_pet.env_name.id}-sbnamespace"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Basic"
}
# Store Service bus namespace
resource "azurerm_app_configuration_key" "sb_namespace" {
  configuration_store_id = azurerm_app_configuration.appconfig.id
  key                    = "ServiceBusNamespace"
  value                  = "${azurerm_servicebus_namespace.sb_namespace.name}.servicebus.windows.net"
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "pg_server" {
  name                   = "${random_pet.env_name.id}-postgresqlserver"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = var.location
  administrator_login    = null
  administrator_password = null
  version                = "15"
  storage_mb             = 32768
  sku_name               = "GP_Standard_D2s_v3"
  zone                   = "1" # don't know what it is
  authentication {
    active_directory_auth_enabled = true
    password_auth_enabled         = false
  }
}

# Get group for PostgreSQL admins
data "azuread_groups" "group" {
  display_names = [var.group_name]
}

# Get current Azure AD client configuration
data "azurerm_client_config" "current" {}

# Active Directory Administrator for PostgreSQL
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "aad_admin" {
  resource_group_name = azurerm_resource_group.rg.name
  server_name         = azurerm_postgresql_flexible_server.pg_server.name
  object_id           = data.azuread_groups.group.object_ids[0]
  tenant_id           = data.azurerm_client_config.current.tenant_id
  principal_name      = data.azuread_groups.group.display_names[0]
  principal_type      = "Group"
}

# for development(allow all IPs)
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_all" {
  name             = "AllowAll"
  server_id        = azurerm_postgresql_flexible_server.pg_server.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}

# Give the access to group role
resource "null_resource" "create_role_group" {
  provisioner "local-exec" {
    command = <<EOT
    export PGPASSWORD=$(az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv)
    psql "host=${azurerm_postgresql_flexible_server.pg_server.name}.postgres.database.azure.com port=5432 dbname=postgres user=${var.group_name} sslmode=require" \
    -c "CREATE ROLE developers_group NOLOGIN;" \
    -c "GRANT pg_monitor TO developers_group;" \
    -c "GRANT pg_read_all_data TO developers_group;" \
    -c "GRANT pg_write_all_data TO developers_group;" \
    -c "GRANT developers_group TO \"${var.group_name}\";"
    EOT
  }
}
