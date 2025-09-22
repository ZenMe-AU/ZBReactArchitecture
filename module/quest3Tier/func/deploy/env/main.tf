# Main Terraform script for deploying function app and database

# create function app
module "function_app" {
  source                                 = "./functionApps"
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
  db_username                            = var.function_app_name
  db_database                            = var.db_name
  db_host                                = data.azurerm_postgresql_flexible_server.main_server.fqdn
}

# create database
module "database" {
  source               = "./database"
  database_name        = var.db_name
  postgresql_server_id = data.azurerm_postgresql_flexible_server.main_server.id
}
