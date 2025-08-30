# Get the Resource Group resource
data "azurerm_resource_group" "main_rg" {
  name = var.resource_group_name
}
# Get the Storage Account resource
data "azurerm_storage_account" "main_sa" {
  name                = var.storage_account_name
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
# # Get the Service Plan resource
# data "azurerm_service_plan" "main_plan" {
#   name                = "${var.target_env}-plan"
#   resource_group_name = data.azurerm_resource_group.main_rg.name
# }
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
# create function app
module "function_app" {
  source                                 = "../../../../../module/shared/func/deploy/terraformTemplate/functionApps"
  function_app_name                      = var.function_app_name
  resource_group_name                    = data.azurerm_resource_group.main_rg.name
  resource_group_location                = data.azurerm_resource_group.main_rg.location
  service_plan_name                      = var.service_plan_name
  storage_account_id                     = data.azurerm_storage_account.main_sa.id
  storage_account_name                   = data.azurerm_storage_account.main_sa.name
  storage_container_name                 = var.storage_account_container_name
  application_insights_connection_string = data.azurerm_application_insights.main_appinsights.connection_string
  application_insights_key               = data.azurerm_application_insights.main_appinsights.instrumentation_key
  user_assigned_identity_id              = data.azurerm_user_assigned_identity.uai.id
  user_assigned_identity_client_id       = data.azurerm_user_assigned_identity.uai.client_id
  appconfig_id                           = data.azurerm_app_configuration.config.id
  env_type                               = var.env_type
}


# Get the postgreSQL server details
data "azurerm_postgresql_flexible_server" "main_server" {
  name                = var.pg_server_name
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# create database
module "database" {
  source               = "../../../../../module/shared/func/deploy/terraformTemplate/database"
  database_name        = var.db_name
  postgresql_server_id = data.azurerm_postgresql_flexible_server.main_server.id
}

# # Get the Service Bus Namespace
# data "azurerm_servicebus_namespace" "sb" {
#   name                = "${var.target_env}-sbnamespace"
#   resource_group_name = data.azurerm_resource_group.main_rg.name
# }

# # create service bus Role Assignments
# module "service_bus" {
#   source                    = "../../../../../module/shared/func/deploy/terraformTemplate/serviceBus"
#   servicebus_namespace_id   = data.azurerm_servicebus_namespace.sb.id
#   function_app_principal_id = module.function_app.principal_id
# }
