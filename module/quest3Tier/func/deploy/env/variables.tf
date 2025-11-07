
# Define variables for the environment deployment

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

# variable "dns_resource_group_name" {
#   description = "Resource group containing the public DNS zone"
#   type        = string
# }

# variable "frontdoor_profile_name" {
#   description = "Existing shared Front Door profile name (created upstream)"
#   type        = string
# }

# variable "frontdoor_endpoint_name" {
#   description = "Existing shared Front Door endpoint name"
#   type        = string
# }

#-------------------------------------------------#
# Fetch existing resources

# Get the Resource Group resource
data "azurerm_resource_group" "main_rg" {
  name = var.resource_group_name
}
# Get the Storage Account resource
data "azurerm_storage_account" "main_sa" {
  name                = var.storage_account_name
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# Get the App Insights resource
data "azurerm_application_insights" "main_appinsights" {
  name                = var.app_insights_name
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
# Get the User Assigned Identity
data "azurerm_user_assigned_identity" "uai" {
  name                = var.identity_name
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
data "azurerm_app_configuration" "config" {
  name                = var.appconfig_name
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
# Get the postgreSQL server details
data "azurerm_postgresql_flexible_server" "main_server" {
  name                = var.pg_server_name
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
