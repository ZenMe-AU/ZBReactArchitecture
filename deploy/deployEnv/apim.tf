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

# Lookup the environment Resource Group by composing the environment type
# prefix and the target environment (prefix + target_env).
# data "azurerm_resource_group" "target" {
#   name = "${var.env_type}-${var.target_env}"
# }

# # Lookup the Application Insights instance used for APIM telemetry.
# data "azurerm_application_insights" "apim_ai" {
#   name                = "${var.target_env}-appinsights"
#   resource_group_name = data.azurerm_resource_group.rg.name
# }

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
  name                = var.apim_name
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name

  publisher_name  = var.apim_publisher_name
  publisher_email = var.apim_publisher_email

  sku_name     = "Consumption_0"
  # ensure the role assignment exists and has propagated before creating APIM
  # Remove depends_on to avoid circular dependency
  # depends_on = [time_sleep.wait_for_role]
}

# # Assign the current principal the API Management Service Contributor role
# # scoped to the resource group to allow APIM sub-resource operations.
# resource "azurerm_role_assignment" "user_apim_contributor" {
#   scope              = azurerm_api_management.apim.id
#   role_definition_id = data.azurerm_role_definition.apim_contributor.id
#   principal_id       = data.azurerm_client_config.current.object_id

#   lifecycle {
#     prevent_destroy = false
#   }
# }

# # Small wait to allow the role assignment to propagate so subsequent APIM
# # list/config calls don't receive 401 Unauthorized from RBAC propagation delays.
# resource "time_sleep" "wait_for_role" {
#   depends_on      = [azurerm_role_assignment.user_apim_contributor]
#   create_duration = "30s"
# }

# APIM logger to send diagnostics to Application Insights
resource "azurerm_api_management_logger" "appinsights" {
  name                = "apim-appinsights"
  resource_group_name = data.azurerm_resource_group.rg.name
  api_management_name = azurerm_api_management.apim.name

  application_insights {
    instrumentation_key = azurerm_application_insights.appinsights.instrumentation_key
  }
}

# locals {
#   # Base URL of the backend service that APIM will forward requests to (this becomes `service_url` on the API). Provide a full public URL for the environment-specific backend.
#   http_api_service_url = "https://${var.apim_name}.azure-api.net"
# }

# Create an APIM API that accepts HTTP requests (wildcard path) and forwards them
# to the configured backend service.
resource "azurerm_api_management_api" "http_api" {
  name                = "wildcardapi"
  resource_group_name = data.azurerm_resource_group.rg.name
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

# Catch-all GET operation (matches GET /* in portal)
resource "azurerm_api_management_api_operation" "catchall_get" {
  operation_id        = "catchall-get"
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.rg.name

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
  resource_group_name = data.azurerm_resource_group.rg.name

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
  resource_group_name = data.azurerm_resource_group.rg.name

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
  resource_group_name = data.azurerm_resource_group.rg.name

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
  resource_group_name = data.azurerm_resource_group.rg.name

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

# API-level policy for all operations
resource "azurerm_api_management_api_policy" "all_operations_policy" {
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.rg.name
  xml_content         = file("apimPolicyAllOperations.xml")
  depends_on = [
    azurerm_api_management_policy_fragment.routing,
    azurerm_api_management_policy_fragment.auth_token
    ]
}

resource "azurerm_api_management_api_operation_policy" "catchall_get_policy" {
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_get.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

resource "azurerm_api_management_api_operation_policy" "catchall_delete_policy" {
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_delete.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

resource "azurerm_api_management_api_operation_policy" "catchall_patch_policy" {
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_patch.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

resource "azurerm_api_management_api_operation_policy" "catchall_post_policy" {
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_post.operation_id
  xml_content = file("apimPolicyDefault.xml") 
}

resource "azurerm_api_management_api_operation_policy" "catchall_put_policy" {
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.rg.name
  operation_id        = azurerm_api_management_api_operation.catchall_put.operation_id
  xml_content = file("apimPolicyDefault.xml")
}


# Configures API-level diagnostics for the WildcardApi to send telemetry to
# Application Insights. This captures request/response data and errors for
# monitoring, alerting, and troubleshooting API behavior.
resource "azurerm_api_management_api_diagnostic" "wildcardapi_diag" {
  resource_group_name      = data.azurerm_resource_group.rg.name
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

resource "azurerm_api_management_policy_fragment" "routing" {
  api_management_id = azurerm_api_management.apim.id
  name              = "backend-routing-fragment"
  format            = "rawxml"

  value = templatefile("${path.module}/routing_fragment.tpl", {
    backends = var.apim_backend_list
    targetEnv = var.target_env
  })
}

resource "azurerm_api_management_policy_fragment" "auth_token" {
  api_management_id = azurerm_api_management.apim.id
  name              = "transform-x-auth-token"
  format            = "rawxml"
  value             = file("transform-x-auth-token.xml")
}