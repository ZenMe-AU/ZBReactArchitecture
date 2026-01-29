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

# --------------------------------------------------------------------
# This section contains apim resources

variable "apim_publisher_name" {
  description = "Display name used in the API Management instance for publisher/branding and support contact information"
  type        = string
  default     = "ZenMe"
}

variable "apim_publisher_email" {
  description = "Contact email used by API Management for publisher/support notifications and administrative contact"
  type        = string
  default     = "admin@zenme.local"
}

# Lookup the environment Resource Group by composing the environment type
# prefix and the target environment (prefix + target_env).
data "azurerm_resource_group" "target" {
  name = "${var.env_type}-${var.target_env}"
}

# Lookup the Application Insights instance used for APIM telemetry.
data "azurerm_application_insights" "apim_ai" {
  name                = "${var.target_env}-appinsights"
  resource_group_name = data.azurerm_resource_group.target.name
}

# Read the current CLI/SDK principal and tenant information.
# Used to determine the caller's object/tenant IDs when creating role assignments
# and for tenant-scoped operations during deployment.
# data "azurerm_client_config" "current" {}

# Resolve the built-in role definition ID for "API Management Service Contributor".
# Having the role definition allows creating role assignments (scoped to the RG)
# that grant APIM management permissions to principals or service identities.
data "azurerm_role_definition" "apim_contributor" {
  name  = "API Management Service Contributor"
  scope = "/subscriptions/${var.subscription_id}"
}

# Create an API Management instance inside the environment resource group
resource "azurerm_api_management" "apim" {
  name                = "${var.target_env}-apim"
  location            = data.azurerm_resource_group.target.location
  resource_group_name = data.azurerm_resource_group.target.name

  publisher_name  = var.apim_publisher_name
  publisher_email = var.apim_publisher_email

  sku_name     = "Consumption_0"
  # ensure the role assignment exists and has propagated before creating APIM
  depends_on = [
    time_sleep.wait_for_role
  ]
}

# Assign the current principal the API Management Service Contributor role
# scoped to the resource group to allow APIM sub-resource operations.
resource "azurerm_role_assignment" "user_apim_contributor" {
  scope              = data.azurerm_resource_group.target.id
  role_definition_id = data.azurerm_role_definition.apim_contributor.id
  principal_id       = data.azurerm_client_config.current.object_id

  lifecycle {
    prevent_destroy = false
  }
}

# Small wait to allow the role assignment to propagate so subsequent APIM
# list/config calls don't receive 401 Unauthorized from RBAC propagation delays.
resource "time_sleep" "wait_for_role" {
  depends_on      = [azurerm_role_assignment.user_apim_contributor]
  create_duration = "30s"
}

# APIM logger to send diagnostics to Application Insights
resource "azurerm_api_management_logger" "appinsights" {
  name                = "appinsights"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  application_insights {
    instrumentation_key = data.azurerm_application_insights.apim_ai.instrumentation_key
  }
}


variable "http_api_path" {
  description = "Path segment under APIM where the HTTP API is hosted; leave empty for root. Used by APIM to route inbound requests to the configured backend service."
  type        = string
  # empty = host root (no suffix). If provider rejects empty, we can map '/'
  default     = ""
}

locals {
  # Base URL of the backend service that APIM will forward requests to (this becomes `service_url` on the API). Provide a full public URL for the environment-specific backend.
  http_api_service_url = "https://${var.target_env}-apim.azure-api.net"
}

# Create an APIM API that accepts HTTP requests (wildcard path) and forwards them
# to the configured backend service.
resource "azurerm_api_management_api" "http_api" {
  name                = "wildcardapi"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  revision     = "1"
  display_name = "WildcardApi"
  path         = var.http_api_path
  protocols    = ["https"]
  api_type     = "http"

  # allow anonymous access (no subscription required)
  subscription_required = false

  service_url = local.http_api_service_url
}

# Create variable for to make url less hard coded
variable "url_ending" {
  description = "Backend service URL ending for the HTTP API"
  type        = string
  default     = "func.azurewebsites.net"
}

# Register an APIM backend referencing the profile function App Service.
resource "azurerm_api_management_backend" "chemicalfirefly_profile_func" {
  name                = "ProfileFunc"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://${var.target_env}-profile-${var.url_ending}"
  protocol = "http"
}

# Register an APIM backend referencing the quest3Tier function App Service.
resource "azurerm_api_management_backend" "chemicalfirefly-quest3Tier-func" {
  name                = "Quest3TierFunc"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://${var.target_env}-quest3tier-${var.url_ending}"
  protocol = "http"
}

# Register an APIM backend referencing the other function App Services not yet added.
resource "azurerm_api_management_backend" "chemicalfirefly-coordinate-func" {
  name                = "CoordinateFunc"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://${var.target_env}-coordinate-${var.url_ending}"
  protocol = "http"
}

resource "azurerm_api_management_backend" "chemicalfirefly-quest5Tier-func" {
  name                = "Quest5TierFunc"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://${var.target_env}-quest5tier-${var.url_ending}"
  protocol = "http"
}

resource "azurerm_api_management_backend" "chemicalfirefly-quest5TierEg-func" {
  name                = "Quest5TierEgFunc"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://${var.target_env}-quest5tier-eg-${var.url_ending}"
  protocol = "http"
}

# Define a catch-all GET operation on the wildcard API which matches any GET path.
resource "azurerm_api_management_api_operation" "catchall_get" {
  operation_id        = "catchall-get"
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.target.name

  display_name  = "CatchAllGet"
  method        = "GET"
  url_template  = "/*"

    response {
        status_code = 200
        description = "Successful response"
    }
}

# Todo: replace this policy with custom domains when Managed certificates are available (March 2026)
# Temporary catch-all policy that routes requests using the X-Forwarded-Host header.
resource "azurerm_api_management_api_operation_policy" "catchall_get_policy" { 
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.target.name
  operation_id        = azurerm_api_management_api_operation.catchall_get.operation_id
  xml_content = file("apimPolicy.xml") 
}


# Configures API-level diagnostics for the WildcardApi to send telemetry to
# Application Insights. This captures request/response data and errors for
# monitoring, alerting, and troubleshooting API behavior.
resource "azurerm_api_management_api_diagnostic" "wildcardapi_diag" {
  resource_group_name      = data.azurerm_resource_group.target.name
  api_management_name      = azurerm_api_management.apim.name
  api_name                 = azurerm_api_management_api.http_api.name

  # identifier is required by the provider schema; allowed: "applicationinsights" or "azuremonitor"
  identifier               = "applicationinsights"
  api_management_logger_id = azurerm_api_management_logger.appinsights.id

  sampling_percentage      = 100
  always_log_errors        = true
  log_client_ip            = true
  http_correlation_protocol = "Legacy"
  verbosity                = "information"

  frontend_request {
    headers_to_log = ["X-Azure-FDID", "X-Forwarded-Host", "X-Forwarded-For", "X-FD-HealthProbe", "Via"]
    body_bytes     = 8192
  }

  backend_request {
    headers_to_log = ["X-Azure-FDID", "X-Forwarded-Host", "X-Forwarded-For", "X-FD-HealthProbe", "Via"]
    body_bytes     = 8192
  }

  depends_on = [azurerm_api_management_logger.appinsights]
}

# --------------------------------------------------------------------

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
