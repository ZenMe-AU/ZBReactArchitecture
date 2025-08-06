# terraform plan -var-file="terraform.tfvars"
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

data "azurerm_client_config" "current" {}

# resource "random_pet" "name1" {
#   length    = 2
#   separator = ""
# }

# resource "azurerm_resource_group" "resourcegroup" {
#   name     = "coherentladybug-resources"
#   location = "Australia East"
# }

# resource "azurerm_postgresql_flexible_server" "resourcegroup" {
#   name                   = "coherentladybug-postresqlserver"
#   resource_group_name    = azurerm_resource_group.resourcegroup.name
#   location               = "Australia East"
#   administrator_login    = null
#   administrator_password = null
#   version                = "13"
#   storage_mb             = 32768
#   sku_name               = "GP_Standard_D2s_v3"
#   authentication {
#     active_directory_auth_enabled = true
#     password_auth_enabled         = false
#   }
# }
# variables.tf
variable "env_name" {
  description = "Environment name"
  type        = string
}

# variable "resource_group" {
#   description = "Resource group name"
#   type        = string
# }

# variable "postgresql_server_name" {
#   description = "PostgreSQL server name"
#   type        = string
# }

variable "postgresql_db_name" {
  description = "PostgreSQL database name"
  type        = string
}

data "azurerm_resource_group" "existing" {
  name = "${var.env_name}-resources"
}

data "azurerm_postgresql_flexible_server" "existing" {
  name                = "${var.env_name}-postresqlserver"
  resource_group_name = data.azurerm_resource_group.existing.name
}

resource "azurerm_postgresql_flexible_server_database" "mydb" {
  name      = var.postgresql_db_name
  server_id = data.azurerm_postgresql_flexible_server.existing.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

# resource "null_resource" "grant_aad_user" {
#   provisioner "local-exec" {
#     command = <<EOT
#     export PGPASSWORD=$(az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv)

#     psql "host=${data.azurerm_postgresql_flexible_server.existing.name}.postgres.database.azure.com \
#     port=5432 \
#     dbname=${var.postgresql_db_name} \
#     user=${data.azurerm_postgresql_flexible_server.existing.administrator_login}@${data.azurerm_postgresql_flexible_server.existing.name} \
#     sslmode=require" \
#     -c "SET aad_validate_oids_in_tenant = off;" \
#     -c "CREATE ROLE '${azurerm_client_config.current.client_id}' WITH LOGIN IN ROLE azure_ad_user;" \
#     -c "GRANT CONNECT ON DATABASE ${var.postgresql_db_name} TO '${azurerm_client_config.current.client_id}';" \
#     -c "GRANT ALL PRIVILEGES ON SCHEMA public TO '${azurerm_client_config.current.client_id}';"
#     EOT
#   }
# }
