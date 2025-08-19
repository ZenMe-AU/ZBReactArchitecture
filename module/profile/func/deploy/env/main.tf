# Get the Resource Group resource
data "azurerm_resource_group" "main_rg" {
  name = "${var.target_env}-resources"
}
# Get the Storage Account resource
data "azurerm_storage_account" "main_sa" {
  name                = "${var.target_env}pvtstor"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
# Get the Service Plan resource
data "azurerm_service_plan" "main_plan" {
  name                = "${var.target_env}-plan"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}
# Get the App Insights resource
data "azurerm_application_insights" "main_appinsights" {
  name                = "${var.target_env}-appinsights"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# create function app
module "function_app" {
  source                                 = "../../../../../terraform/moduleTemplate/functionApps"
  function_app_name                      = "${var.target_env}-${var.module_name}-func"
  resource_group_name                    = data.azurerm_resource_group.main_rg.name
  resource_group_location                = data.azurerm_resource_group.main_rg.location
  service_plan_id                        = data.azurerm_service_plan.main_plan.id
  storage_account_name                   = data.azurerm_storage_account.main_sa.name
  application_insights_connection_string = data.azurerm_application_insights.main_appinsights.connection_string
  application_insights_key               = data.azurerm_application_insights.main_appinsights.instrumentation_key
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

# Get the Service Bus Namespace
data "azurerm_servicebus_namespace" "sb" {
  name                = "${var.target_env}-sbnamespace"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# create service bus Role Assignments
module "service_bus" {
  source                    = "../../../../../terraform/moduleTemplate/serviceBus"
  servicebus_namespace_id   = data.azurerm_servicebus_namespace.sb.id
  function_app_principal_id = module.function_app.principal_id
}
