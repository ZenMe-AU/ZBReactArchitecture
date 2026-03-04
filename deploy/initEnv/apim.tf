variable "apim_publisher_name" {
  description = "Publisher name for APIM"
  type        = string
  default     = "ZenMe"
}

variable "apim_publisher_email" {
  description = "Publisher email for APIM"
  type        = string
  default     = "admin@zenme.local"
}

variable "apim_name" {
  description = "Name of the API Management instance"
  type        = string
}

variable "http_api_path" {
  description = "Path segment for the HTTP API in APIM"
  type        = string
  # empty = host root (no suffix). If provider rejects empty, we can map '/'
  default     = ""
}

# current CLI/SDK principal details (used to assign roles)
data "azurerm_client_config" "current" {}

# lookup the built-in role definition for APIM contributor at subscription scope
data "azurerm_role_definition" "apim_contributor" {
  name  = "API Management Service Contributor"
  scope = "/subscriptions/${var.subscription_id}"
}

# Create an API Management instance inside the resource group
resource "azurerm_api_management" "apim" {
  name                = var.apim_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  publisher_name  = var.apim_publisher_name
  publisher_email = var.apim_publisher_email

  sku_name     = "Consumption_0"
  # ensure the role assignment exists and has propagated before creating APIM
  depends_on = [
    time_sleep.wait_for_role
  ]
}

# TODO: assign role to group instead of user? or both?
# Assign the current principal the API Management Service Contributor role
# scoped to the resource group to allow APIM sub-resource operations.
resource "azurerm_role_assignment" "user_apim_contributor" {
  scope              = azurerm_resource_group.rg.id
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

# TODO: should i move this to deployEnv?
# reference existing Application Insights instance
data "azurerm_application_insights" "apim_ai" {
  name                = "${var.target_env}-appinsights"
  resource_group_name = azurerm_resource_group.rg.name
}
# APIM logger to send diagnostics to Application Insights
resource "azurerm_api_management_logger" "appinsights" {
  name                = "appinsights"
  resource_group_name = azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.apim.name

  application_insights {
    instrumentation_key = data.azurerm_application_insights.apim_ai.instrumentation_key
  }
}


# Create a simple HTTP API inside the API Management instance
resource "azurerm_api_management_api" "http_api" {
  name                = "wildcardapi"
  resource_group_name = azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.apim.name

  revision     = "1"
  display_name = "WildcardApi"
  path         = var.http_api_path
  protocols    = ["https"]
  api_type     = "http"

  # allow anonymous access (no subscription required)
  subscription_required = false

  service_url = azurerm_api_management.apim.gateway_url
}

# TODO: should i move this to each module?
# Backend that points to the existing App Service
resource "azurerm_api_management_backend" "profile_func" {
  name                = "${var.target_env}-profile-func"
  resource_group_name = azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://${var.target_env}-profile-func.azurewebsites.net"
  protocol = "http"

  # No credentials required for this public App Service; adjust if needed.
}

# Backend that points to the existing App Service chemicalfirefly-quest3tier-func
resource "azurerm_api_management_backend" "quest3tier_func" {
  name                = "${var.target_env}-quest3tier-func"
  resource_group_name = azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://${var.target_env}-quest3tier-func.azurewebsites.net"
  protocol = "http"

  # No credentials required for this public App Service; adjust if needed.
}

# TODO: move this to deployEnv?
# Catch-all GET operation (matches GET /* in portal)
resource "azurerm_api_management_api_operation" "catchall_get" {
  operation_id        = "catchall-get"
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name

  display_name  = "CatchAllGet"
  method        = "GET"
  url_template  = "/*"

    response {
        status_code = 200
        description = "Successful response"
    }
}

resource "azurerm_api_management_api_operation" "catchall_delete" {
  operation_id        = "catchall-delete"
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name

  display_name  = "CatchAllDelete"
  method        = "DELETE"
  url_template  = "/*"

    response {
        status_code = 200
        description = "Successful response"
    }
}

resource "azurerm_api_management_api_operation" "catchall_patch" {
  operation_id        = "catchall-patch"
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name

  display_name  = "CatchAllPatch"
  method        = "PATCH"
  url_template  = "/*"

    response {
        status_code = 200
        description = "Successful response"
    }
}

resource "azurerm_api_management_api_operation" "catchall_post" {
  operation_id        = "catchall-post"
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name

  display_name  = "CatchAllPost"
  method        = "POST"
  url_template  = "/*"

    response {
        status_code = 200
        description = "Successful response"
    }
}

resource "azurerm_api_management_api_operation" "catchall_put" {
  operation_id        = "catchall-put"
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name

  display_name  = "CatchAllPut"
  method        = "PUT"
  url_template  = "/*"

    response {
        status_code = 200
        description = "Successful response"
    }
}

# TODO: replace this policy with custom domains when Managed certificates are available (March 2026)
# The CatchAll Policy routes requests based on the X-Forwarded-Host header instead of the Custom Domain for all operations.

#TODO: Add all operations section and import file apimPolicyAllpOperations.xml

# API-level policy for all operations
resource "azurerm_api_management_api_operation_policy" "all_operations_policy" {
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.target.name
  operation_id        = "*"
  xml_content         = file("apimPolicyAllOperations.xml")
}


resource "azurerm_api_management_api_operation_policy" "catchall_get_policy" { 
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_get.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

resource "azurerm_api_management_api_operation_policy" "catchall_delete_policy" { 
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_delete.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

resource "azurerm_api_management_api_operation_policy" "catchall_patch_policy" { 
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_patch.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

resource "azurerm_api_management_api_operation_policy" "catchall_post_policy" { 
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_post.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

resource "azurerm_api_management_api_operation_policy" "catchall_put_policy" { 
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_put.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

# API-level diagnostic for WildcardApi (sends telemetry to Application Insights)
resource "azurerm_api_management_api_diagnostic" "wildcardapi_diag" {
  resource_group_name      = azurerm_resource_group.rg.name
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
