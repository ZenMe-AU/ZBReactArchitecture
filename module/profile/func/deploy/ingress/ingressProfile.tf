## NOTE: When this file is copied into deploy/ingress/dist alongside ingress.tf,
## it uses the provider and shared variables declared there to avoid duplicates.

# ------------------------------------------------------------
# Profile module Front Door slice (API + optional landing)
# Responsibilities:
# - Reference shared Front Door profile + endpoint
# - Create module-specific origin group/origin/route for API
# - Optionally create web origin/route for landing/static paths
# - Attach existing custom domain if provided (do not create it)
# ------------------------------------------------------------

# Core identifiers
variable "target_env" {
  type        = string
  description = "Environment key (e.g. dev, test, prod)"
}
variable "module_name" {
  type        = string
  description = "Module name owning this ingress slice (e.g. profile)"
}

# Shared foundation references are declared in deploy/ingress/ingress.tf
## Expected variables available: central_env, frontdoor_profile_name

# Existing Function App origin (Profile API)
variable "function_app_name" {
  type        = string
  description = "Profile API Function App name"
}
variable "resource_group_name" {
  type        = string
  description = "Resource group of the Function App"
}

# Optional custom domain to associate (already created elsewhere)
variable "custom_domain_resource_id" {
  type        = string
  description = "Resource ID of existing Front Door custom domain to attach"
  default     = ""
}

# API route controls
variable "api_route_pattern" {
  type        = string
  description = "Route pattern for Profile API traffic"
  default     = "/api/profile/*"
}
variable "enable_api_route" {
  type        = bool
  description = "Whether to create the Profile API route"
  default     = true
}

## Optional landing/static route controls reuse environment-level variables declared in ingress.tf:
## - enable_web_origin (bool)
## - web_origin_host_override (string)
variable "web_route_pattern" {
  type        = string
  description = "Route pattern for landing/static content"
  default     = "/profile/*"
}

# ------------------------------------------------------------
# Data sources
# ------------------------------------------------------------
data "azurerm_cdn_frontdoor_profile" "shared" {
  name                = var.frontdoor_profile_name
  resource_group_name = var.central_env
}


data "azurerm_linux_function_app" "profile_api" {
  name                = var.function_app_name
  resource_group_name = var.resource_group_name
}

# ------------------------------------------------------------
# Locals
# ------------------------------------------------------------
locals {
  # Refer to the endpoint resource created in ingress.tf in the same root module
  endpoint_id            = azurerm_cdn_frontdoor_endpoint.env.id
  profile_id             = data.azurerm_cdn_frontdoor_profile.shared.id
  custom_domain_ids      = var.custom_domain_resource_id != "" ? [var.custom_domain_resource_id] : []
  web_enabled            = var.enable_web_origin && var.web_origin_host_override != ""
  api_route_name         = "${var.target_env}-${var.module_name}-api-route"
  api_origin_group_name  = "${var.target_env}-${var.module_name}-api-og"
  api_origin_name        = "${var.target_env}-${var.module_name}-api-origin"
  web_route_name         = "${var.target_env}-${var.module_name}-web-route"
  web_origin_group_name  = "${var.target_env}-${var.module_name}-web-og"
  web_origin_name        = "${var.target_env}-${var.module_name}-web-origin"
}

# ------------------------------------------------------------
# API origin group + origin + route
# ------------------------------------------------------------
resource "azurerm_cdn_frontdoor_origin_group" "profile_api" {
  name                     = local.api_origin_group_name
  cdn_frontdoor_profile_id = local.profile_id

  health_probe {
    protocol            = "Http"
    path                = "/"
    request_type        = "GET"
    interval_in_seconds = 30
  }

  load_balancing {
    sample_size                 = 4
    successful_samples_required = 3
  }
}

resource "azurerm_cdn_frontdoor_origin" "profile_api" {
  name                          = local.api_origin_name
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.profile_api.id
  host_name                     = data.azurerm_linux_function_app.profile_api.default_hostname
  origin_host_header            = data.azurerm_linux_function_app.profile_api.default_hostname
  http_port                     = 80
  https_port                    = 443
  priority                      = 1
  weight                        = 1000
  enabled                       = true
  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_route" "profile_api" {
  count                           = var.enable_api_route ? 1 : 0
  name                            = local.api_route_name
  cdn_frontdoor_endpoint_id       = local.endpoint_id
  cdn_frontdoor_origin_group_id   = azurerm_cdn_frontdoor_origin_group.profile_api.id
  cdn_frontdoor_origin_ids        = [azurerm_cdn_frontdoor_origin.profile_api.id]
  cdn_frontdoor_custom_domain_ids = local.custom_domain_ids

  patterns_to_match      = [var.api_route_pattern]
  supported_protocols    = ["Http", "Https"]
  forwarding_protocol    = "MatchRequest"
  https_redirect_enabled = true
}

# ------------------------------------------------------------
# Optional web origin + route
# ------------------------------------------------------------
resource "azurerm_cdn_frontdoor_origin_group" "profile_web" {
  count                    = local.web_enabled ? 1 : 0
  name                     = local.web_origin_group_name
  cdn_frontdoor_profile_id = local.profile_id

  health_probe {
    protocol            = "Http"
    path                = "/"
    request_type        = "GET"
    interval_in_seconds = 30
  }

  load_balancing {
    sample_size                 = 4
    successful_samples_required = 3
  }
}

resource "azurerm_cdn_frontdoor_origin" "profile_web" {
  count                         = local.web_enabled ? 1 : 0
  name                          = local.web_origin_name
  cdn_frontdoor_origin_group_id = one(azurerm_cdn_frontdoor_origin_group.profile_web[*].id)
  host_name                     = var.web_origin_host_override
  origin_host_header            = var.web_origin_host_override
  http_port                     = 80
  https_port                    = 443
  priority                      = 1
  weight                        = 1000
  enabled                       = true
  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_route" "profile_web" {
  count                           = local.web_enabled ? 1 : 0
  name                            = local.web_route_name
  cdn_frontdoor_endpoint_id       = local.endpoint_id
  cdn_frontdoor_origin_group_id   = one(azurerm_cdn_frontdoor_origin_group.profile_web[*].id)
  cdn_frontdoor_origin_ids        = [one(azurerm_cdn_frontdoor_origin.profile_web[*].id)]
  cdn_frontdoor_custom_domain_ids = local.custom_domain_ids

  patterns_to_match      = [var.web_route_pattern]
  supported_protocols    = ["Http", "Https"]
  forwarding_protocol    = "MatchRequest"
  https_redirect_enabled = true
}

# ------------------------------------------------------------
# Outputs
# ------------------------------------------------------------
output "profile_api_route_name" {
  value       = one(azurerm_cdn_frontdoor_route.profile_api[*].name)
  description = "Name of the Front Door route handling the Profile API"
}

output "profile_web_route_name" {
  value       = one(azurerm_cdn_frontdoor_route.profile_web[*].name)
  description = "Name of the Front Door route handling Profile landing (if enabled)"
}

output "profile_api_origin_host" {
  value       = data.azurerm_linux_function_app.profile_api.default_hostname
  description = "Resolved host for Profile API origin"
}
