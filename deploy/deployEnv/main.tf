# Configure log analytics
resource "azurerm_log_analytics_workspace" "loganalytics_workspace" {
  name                = var.log_analytics_workspace_name
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}


resource "azurerm_app_configuration_key" "env_type" {
  configuration_store_id = data.azurerm_app_configuration.appconfig.id
  key                    = "EnvironmentType"
  value                  = var.env_type
  label                  = var.env_type
}

# # App Service Plan
# resource "azurerm_service_plan" "plan" {
#   name                = "${var.target_env}-plan"
#   location            = data.azurerm_resource_group.rg.location
#   resource_group_name = data.azurerm_resource_group.rg.name
#   os_type             = "Linux"
#   sku_name            = "FC1" # Flex Consumption Plan
# }
# output "plan_id" {
#   value = azurerm_service_plan.plan.id
# }
# output "plan_os" {
#   value = azurerm_service_plan.plan.os_type
# }

# Service bus namespace
resource "azurerm_servicebus_namespace" "sb_namespace" {
  name                = var.service_bus_name
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

# Create PostgreSQL Server where each module can create their own database.
# sku_name has a special pattern (tier + name),
# See https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/postgresql_flexible_server, 
# https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/
# and az postgres flexible-server list-skus --output table --location australiaeast
resource "azurerm_postgresql_flexible_server" "pg_server" {
  name                   = var.postgresql_server_name
  resource_group_name    = data.azurerm_resource_group.rg.name
  location               = data.azurerm_resource_group.rg.location
  administrator_login    = null
  administrator_password = null
  version                = "15"
  storage_mb             = 32768
  sku_name               = "B_Standard_B1ms" # Special pattern see comment above.
  zone                   = "1"               # don't know what it is
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

# resource "azuread_group" "pg_admin_group" {
#   display_name     = "${var.target_env}-pg-admins"
#   security_enabled = true
#   mail_enabled     = false
# }

# data "azuread_group" "pg_admin_group" {
#   display_name = var.db_admin_group_name
# }
# output "pg_admin_group" {
#   value = data.azuread_group.pg_admin_group.display_name
# }
resource "azurerm_app_configuration_key" "db_host" {
  configuration_store_id = data.azurerm_app_configuration.appconfig.id
  key                    = "DbHost"
  value                  = azurerm_postgresql_flexible_server.pg_server.fqdn
  label                  = var.env_type
}

data "azurerm_app_configuration_key" "db_admin_group" {
  configuration_store_id = data.azurerm_app_configuration.appconfig.id
  key                    = "DbAdminGroupId"
}

# Set Administrator group for PostgreSQL
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "pg_admin" {
  resource_group_name = data.azurerm_resource_group.rg.name
  server_name         = azurerm_postgresql_flexible_server.pg_server.name
  object_id           = data.azurerm_app_configuration_key.db_admin_group.value
  tenant_id           = data.azurerm_client_config.current.tenant_id
  principal_name      = var.db_admin_group_name
  principal_type      = "Group"
}

# Set github Administrator for PostgreSQL
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "pg_admin_github" {
  count               = local.has_deployer ? 1 : 0
  resource_group_name = data.azurerm_resource_group.rg.name
  server_name         = azurerm_postgresql_flexible_server.pg_server.name
  object_id           = var.deployer_sp_object_id
  tenant_id           = data.azurerm_client_config.current.tenant_id
  principal_name      = var.deployer_sp_name
  principal_type      = "ServicePrincipal"
}

# Create a User Assigned Identity
resource "azurerm_user_assigned_identity" "uai" {
  name                = var.identity_name
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
}
output "uai_principal_id" {
  value = azurerm_user_assigned_identity.uai.principal_id
}

# Assign the Storage Blob Data Contributor role to the group
resource "azurerm_role_assignment" "group_storage_blob_contributor" {
  scope                = data.azurerm_storage_account.sa.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.uai.principal_id
}
# Assign the Storage Queue Data Contributor role to the group
resource "azurerm_role_assignment" "group_storage_queue_contributor" {
  scope                = data.azurerm_storage_account.sa.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_user_assigned_identity.uai.principal_id
}
# Assign the Storage Table Data Contributor role to the group
resource "azurerm_role_assignment" "group_storage_table_contributor" {
  scope                = data.azurerm_storage_account.sa.id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = azurerm_user_assigned_identity.uai.principal_id
}

# Create Role Assignments
resource "azurerm_role_assignment" "servicebus_sender" {
  scope                = azurerm_servicebus_namespace.sb_namespace.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = azurerm_user_assigned_identity.uai.principal_id
}

resource "azurerm_role_assignment" "servicebus_receiver" {
  scope                = azurerm_servicebus_namespace.sb_namespace.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = azurerm_user_assigned_identity.uai.principal_id
}

# API Management Service
resource "azurerm_api_management" "apim" {
  name                = "${var.target_env}-apim"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  publisher_name      = "Zenme"
  publisher_email     = "xxxx@xxxx.com.au"
  sku_name            = "Developer_1" # Change to Basic/Standard/Premium if needed
}

# resource "azurerm_eventgrid_namespace" "eventgrid_namespace" {
#   capacity              = 1
#   location              = data.azurerm_resource_group.rg.location
#   name                  = "hugejunglefowl-egnamespace"
#   public_network_access = "Enabled"
#   resource_group_name   = data.azurerm_resource_group.rg.name
#   sku                   = "Standard"
#   tags                  = {}
#   identity {
#     identity_ids = ["/subscriptions/0930d9a7-2369-4a2d-a0b6-5805ef505868/resourceGroups/dev-hugejunglefowl/providers/Microsoft.ManagedIdentity/userAssignedIdentities/hugejunglefowl-identity"]
#     type         = "SystemAssigned, UserAssigned"
#   }
#   topic_spaces_configuration {
#     alternative_authentication_name_source          = []
#     maximum_client_sessions_per_authentication_name = 1
#     maximum_session_expiry_in_hours                 = 1
#     route_topic_id                                  = ""
#   }
# }
