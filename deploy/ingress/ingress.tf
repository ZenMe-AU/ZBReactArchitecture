terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0"
    }
  }
  required_version = ">= 1.4.0"
}

provider "azurerm" {
  features {}
}

# Ingress layer responsibilities (post-module slices):
# - Create per-environment Front Door endpoint
# - Attach environment-scoped custom domain & DNS records
# - Provide a fallback web origin/route (/*) for static content
# Module slices now own API and feature-specific routes; keep catch-all here minimal.

# Central Front Door references
variable "central_env" {
  type        = string
  description = "Central resource group name (from central.env CENTRAL_ENV)"
  default     = ""
  validation {
    condition     = length(var.central_env) > 0
    error_message = "central_env must be provided (resource group of the central Front Door)."
  }
}
## Front Door profile name (align with central FdBase)
variable "frontdoor_profile_name" {
  type        = string
  description = "Name of the central Front Door profile (shared)"
  default     = "FrontDoor"
}


# Env identification
variable "environment_key" {
  type        = string
  description = "Environment identifier (used for naming). If empty, falls back to TARGET_ENV from deploy/.env"
  default     = ""
}


# DNS
variable "parent_domain_name" {
  type        = string
  description = "Parent DNS zone (e.g., zenblox.com.au)"
  default     = ""
}
variable "dns_zone_resource_group" {
  type        = string
  description = "Resource group containing DNS zone (defaults to central_env)"
  default     = ""
}
variable "enable_custom_domain" {
  type        = bool
  description = "Whether to create custom domain and DNS records"
  default     = true
}

# Optional direct override for origin host

# Web origin (static site) support
variable "enable_web_origin" {
  type        = bool
  description = "Enable creation of a web origin to serve '/' and non-API paths"
  default     = true
}

variable "web_origin_host_override" {
  type        = string
  description = "Static website origin host (e.g., mystorage.z13.web.core.windows.net). If empty, web route is skipped."
  default     = ""
}


locals {
  central_env_final        = var.central_env
  parent_domain_name_final = var.parent_domain_name
  environment_key_final    = var.environment_key
}

locals {
  frontdoor_profile_name_effective = var.frontdoor_profile_name
}

# Look ups
data "azurerm_cdn_frontdoor_profile" "central" {
  name                = local.frontdoor_profile_name_effective
  resource_group_name = local.central_env_final
}

data "azurerm_dns_zone" "zone" {
  count               = var.enable_custom_domain ? 1 : 0
  name                = local.parent_domain_name_final
  resource_group_name = coalesce(var.dns_zone_resource_group, local.central_env_final)
}

locals {
  # API routing owned by module slices; only retain web origin host
  final_web_origin_host = var.web_origin_host_override
}

# Endpoint
resource "azurerm_cdn_frontdoor_endpoint" "env" {
  # Always create the endpoint; routing may be added later once origin is known
  name                     = "${local.environment_key_final}-central-fd"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.central.id
}


# Web (static site) origin and route for all other paths
resource "azurerm_cdn_frontdoor_origin_group" "env_web" {
  count                    = var.enable_web_origin && var.enable_custom_domain && local.final_web_origin_host != "" ? 1 : 0
  name                     = "${local.environment_key_final}-web-og"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.central.id

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

resource "azurerm_cdn_frontdoor_origin" "env_web" {
  count                         = var.enable_web_origin && var.enable_custom_domain && local.final_web_origin_host != "" ? 1 : 0
  name                          = "${local.environment_key_final}-web-origin"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.env_web[0].id
  host_name                     = local.final_web_origin_host
  origin_host_header            = local.final_web_origin_host
  http_port                     = 80
  https_port                    = 443
  priority                      = 1
  weight                        = 1000
  enabled                       = true
  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_route" "env_web" {
  count                           = var.enable_web_origin && var.enable_custom_domain && local.final_web_origin_host != "" ? 1 : 0
  name                            = "${local.environment_key_final}-web"
  cdn_frontdoor_endpoint_id       = azurerm_cdn_frontdoor_endpoint.env.id
  cdn_frontdoor_origin_group_id   = azurerm_cdn_frontdoor_origin_group.env_web[0].id
  cdn_frontdoor_origin_ids        = [azurerm_cdn_frontdoor_origin.env_web[0].id]
  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.env_domain[0].id]

  # Catch-all fallback; module slices should register more specific patterns (e.g. /api/profile/*)
  patterns_to_match     = ["/*"]
  supported_protocols   = ["Http", "Https"]
  forwarding_protocol   = "MatchRequest"
  https_redirect_enabled = true
}

# Custom domain + DNS
resource "azurerm_cdn_frontdoor_custom_domain" "env_domain" {
  count                    = var.enable_custom_domain ? 1 : 0
  name                     = "${local.environment_key_final}-dns"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.central.id
  host_name                = "${local.environment_key_final}.${local.parent_domain_name_final}"
  tls { certificate_type = "ManagedCertificate" }
}

resource "azurerm_dns_cname_record" "env_cname" {
  count               = var.enable_custom_domain ? 1 : 0
  name                = local.environment_key_final
  zone_name           = data.azurerm_dns_zone.zone[0].name
  resource_group_name = coalesce(var.dns_zone_resource_group, local.central_env_final)
  ttl                 = 3600
  record              = azurerm_cdn_frontdoor_endpoint.env.host_name
}

resource "azurerm_dns_txt_record" "env_txt" {
  count               = var.enable_custom_domain ? 1 : 0
  name                = "_dnsauth.${local.environment_key_final}"
  zone_name           = data.azurerm_dns_zone.zone[0].name
  resource_group_name = coalesce(var.dns_zone_resource_group, local.central_env_final)
  ttl                 = 3600
  record { value = azurerm_cdn_frontdoor_custom_domain.env_domain[0].validation_token }
}


output "env_endpoint_host" {
  value       = azurerm_cdn_frontdoor_endpoint.env.host_name
  description = "Front Door endpoint hostname (always created)"
}
output "env_custom_domain" {
  value       = var.enable_custom_domain && length(azurerm_cdn_frontdoor_custom_domain.env_domain) > 0 ? azurerm_cdn_frontdoor_custom_domain.env_domain[0].host_name : ""
  description = "Custom domain FQDN (empty if disabled or not created)"
}
output "env_cname_target" {
  value       = azurerm_cdn_frontdoor_endpoint.env.host_name
  description = "Endpoint host the CNAME points to"
}
output "env_txt_record_name" {
  value       = var.enable_custom_domain ? "_dnsauth.${local.environment_key_final}.${local.parent_domain_name_final}" : ""
  description = "TXT record name for validation (empty if not created)"
}
