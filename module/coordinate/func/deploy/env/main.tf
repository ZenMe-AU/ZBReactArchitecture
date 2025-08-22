# Get the Resource Group resource
data "azurerm_resource_group" "main_rg" {
  name = "${var.target_env}-resources"
}
# Get the Storage Account resource
data "azurerm_storage_account" "main_sa" {
  name                = "${var.target_env}pvtstor"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# Get the App Insights resource
data "azurerm_application_insights" "main_appinsights" {
  name                = "${var.target_env}-appinsights"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
# Get the User Assigned Identity
data "azurerm_user_assigned_identity" "uai" {
  name                = "${var.target_env}-uai"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
# create function app
module "function_app" {
  source                                 = "../../../../../terraform/moduleTemplate/functionApps"
  function_app_name                      = "${var.target_env}-${var.module_name}-func"
  resource_group_name                    = data.azurerm_resource_group.main_rg.name
  resource_group_location                = data.azurerm_resource_group.main_rg.location
  service_plan_name                      = "${var.target_env}-${var.module_name}-plan"
  storage_account_id                     = data.azurerm_storage_account.main_sa.id
  storage_account_name                   = data.azurerm_storage_account.main_sa.name
  storage_container_name                 = lower("${var.target_env}-${var.module_name}-stor")
  application_insights_connection_string = data.azurerm_application_insights.main_appinsights.connection_string
  application_insights_key               = data.azurerm_application_insights.main_appinsights.instrumentation_key
  user_assigned_identity_id              = data.azurerm_user_assigned_identity.uai.id
  user_assigned_identity_client_id       = data.azurerm_user_assigned_identity.uai.client_id
}

# Get the postgreSQL server details
data "azurerm_postgresql_flexible_server" "main_server" {
  name                = "${var.target_env}-postgresqlserver"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# create database
module "database" {
  source               = "../../../../../terraform/moduleTemplate/database"
  database_name        = var.module_name
  postgresql_server_id = data.azurerm_postgresql_flexible_server.main_server.id
}
