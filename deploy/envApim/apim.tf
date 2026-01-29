# APIM origin group for wildcard traffic

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0"
    }
    time = {
      source  = "hashicorp/time"
      version = ">= 0.7.2"
    }
  }
  required_version = ">= 1.4.0"
}

# Subscription to use for provider operations. Set via TF_VAR_subscription_id,
# or edit this file to set a default value for non-interactive runs.
variable "subscription_id" {
  description = "Azure subscription id for provider authentication"
  type        = string
  default     = "0930d9a7-2369-4a2d-a0b6-5805ef505868"
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

variable "envName" {
    description = "Environment name"
    type        = string
    default = "dev-chemicalfirefly"
}


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

# reference existing resource group where APIM should be created
data "azurerm_resource_group" "target" {
  name = "dev-chemicalfirefly"
}

# reference existing Application Insights instance
data "azurerm_application_insights" "apim_ai" {
  name                = "chemicalfirefly-appinsights"
  resource_group_name = data.azurerm_resource_group.target.name
}

# current CLI/SDK principal details (used to assign roles)
data "azurerm_client_config" "current" {}

# lookup the built-in role definition for APIM contributor at subscription scope
data "azurerm_role_definition" "apim_contributor" {
  name  = "API Management Service Contributor"
  scope = "/subscriptions/${var.subscription_id}"
}

# Create an API Management instance inside the dev-chemicalfirefly resource group
resource "azurerm_api_management" "apim" {
  name                = "${var.envName}-apim"
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
  description = "Path segment for the HTTP API in APIM"
  type        = string
  # empty = host root (no suffix). If provider rejects empty, we can map '/'
  default     = ""
}

variable "http_api_service_url" {
  description = "Backend service URL for the HTTP API"
  type        = string
  default     = "https://chemicalfirefly-apim.azure-api.net"
}

# Create a simple HTTP API inside the API Management instance
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

  service_url = var.http_api_service_url
}

# Backend that points to the existing App Service chemicalfirefly-profile-func
resource "azurerm_api_management_backend" "chemicalfirefly_profile_func" {
  name                = "chemicalfireflyProfileFunc"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://chemicalfirefly-profile-func.azurewebsites.net"
  protocol = "http"

  # No credentials required for this public App Service; adjust if needed.
}

# Backend that points to the existing App Service chemicalfirefly-quest3tier-func
resource "azurerm_api_management_backend" "chemicalfirefly-quest3Tier-func" {
  name                = "chemicalfireflyQuest3TierFunc"
  resource_group_name = data.azurerm_resource_group.target.name
  api_management_name = azurerm_api_management.apim.name

  # App Service default domain
  url      = "https://chemicalfirefly-quest3tier-func.azurewebsites.net"
  protocol = "http"

  # No credentials required for this public App Service; adjust if needed.
}

# Catch-all GET operation (matches GET /* in portal)
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
# The CatchAll Policy routes requests based on the X-Forwarded-Host header instead of the Custom Domain.
resource "azurerm_api_management_api_operation_policy" "catchall_get_policy" { 
  api_name            = azurerm_api_management_api.http_api.name
  api_management_name = azurerm_api_management.apim.name
  resource_group_name = data.azurerm_resource_group.target.name
  operation_id        = azurerm_api_management_api_operation.catchall_get.operation_id
  xml_content = file("apimPolicy.xml") 
}


# API-level diagnostic for WildcardApi (sends telemetry to Application Insights)
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
