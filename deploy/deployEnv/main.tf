# Configure log analytics
resource "azurerm_log_analytics_workspace" "loganalytics_workspace" {
  name                = "${var.target_env}-law"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}


resource "azurerm_app_configuration_key" "env_type" {
  configuration_store_id = data.azurerm_app_configuration.appconfig.id
  key                    = "EnvironmentType"
  value                  = "Development"
  label                  = "dev"
}

# App Service Plan
resource "azurerm_service_plan" "plan" {
  name                = "${var.target_env}-plan"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "Y1" # Consumption
}
output "plan_id" {
  value = azurerm_service_plan.plan.id
}
output "plan_os" {
  value = azurerm_service_plan.plan.os_type
}

# Service bus namespace
resource "azurerm_servicebus_namespace" "sb_namespace" {
  name                = "${var.target_env}-sbnamespace"
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  sku                 = "Basic"
}
# Store Service bus namespace
# resource "azurerm_app_configuration_key" "sb_namespace" {
#   configuration_store_id = data.azurerm_app_configuration.appconfig.id
#   key                    = "ServiceBusNamespace"
#   value                  = "${azurerm_servicebus_namespace.sb_namespace.name}.servicebus.windows.net"
# }
output "sb_namespace" {
  value = azurerm_servicebus_namespace.sb_namespace.name
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "pg_server" {
  name                   = "${var.target_env}-postgresqlserver"
  resource_group_name    = data.azurerm_resource_group.rg.name
  location               = data.azurerm_resource_group.rg.location
  administrator_login    = null
  administrator_password = null
  version                = "15"
  storage_mb             = 32768
  sku_name               = "GP_Standard_D2s_v3"
  zone                   = "1" # don't know what it is
  authentication {
    active_directory_auth_enabled = true
    password_auth_enabled         = false
    tenant_id                     = data.azurerm_client_config.current.tenant_id
  }
}
output "pg_name" {
  value = azurerm_postgresql_flexible_server.pg_server.name
}

output "pg_id" {
  value = azurerm_postgresql_flexible_server.pg_server.id
}

resource "azuread_group" "pg_admin_group" {
  display_name     = "${var.target_env}-pg-admins"
  security_enabled = true
  mail_enabled     = false
}
output "pg_admin_group" {
  value = azuread_group.pg_admin_group.display_name
}

# Set Administrator for PostgreSQL
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "pg_admin" {
  resource_group_name = data.azurerm_resource_group.rg.name
  server_name         = azurerm_postgresql_flexible_server.pg_server.name
  object_id           = azuread_group.pg_admin_group.object_id
  tenant_id           = data.azurerm_client_config.current.tenant_id
  principal_name      = azuread_group.pg_admin_group.display_name
  principal_type      = "Group"
}

# Create a group for storage contributors
resource "azuread_group" "storage_contrib_group" {
  display_name     = "${var.target_env}-pvtstor-contributors"
  security_enabled = true
  mail_enabled     = false
}
output "storage_contrib_group" {
  value = azuread_group.storage_contrib_group.display_name
}

# Assign the Storage Blob Data Contributor role to the group
resource "azurerm_role_assignment" "group_storage_blob_contributor" {
  scope                = data.azurerm_storage_account.sa.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azuread_group.storage_contrib_group.object_id
}
