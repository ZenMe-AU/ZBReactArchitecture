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

# Optional prefix used in naming across ingress slices (e.g., "chemicalfirefly")
variable "name_prefix" {
  type        = string
  description = "Optional name prefix applied to route/origin names across modules"
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

variable "target_env" {
  type        = string
  description = "Target environment name (overrides .env if provided)"
  default     = ""
}

locals {
  # Safely read .env (if present) and parse KEY=VALUE lines into a map
  _dotenv_content = try(file("${path.module}/.env"), "")
  # Robust parser using split rather than regex to avoid index errors
  _dotenv_lines   = length(local._dotenv_content) > 0 ? compact(split("\n", local._dotenv_content)) : []
  _dotenv_raw     = {
    for l in local._dotenv_lines :
    trimspace(split("=", l)[0]) => trimspace(join("=", slice(split("=", l), 1, length(split("=", l)))) )
    if length(split("=", l)) >= 2
  }

  # Effective target_env: prefer explicit variable, otherwise .env target_env, otherwise empty
  target_env_effective = var.target_env != "" ? var.target_env : lookup(local._dotenv_raw, "target_env", "")
}

# Wildcard subdomain for a specific app (e.g., *.chemicalfirefly.zenblox.com.au)
variable "enable_rg_wildcard" {
  type        = bool
  description = "Enable wildcard custom domain for chemicalfirefly subdomain (e.g., *.chemicalfirefly.<parent_domain>)"
  default     = true
}

variable "rg_apim_gateway_host" {
  type        = string
  description = "APIM gateway host FQDN to forward wildcard traffic to (e.g., chemicalfirefly-apim.azure-api.net)"
  default     = ""
}


locals {
  central_env_final        = var.central_env
  parent_domain_name_final = var.parent_domain_name
  environment_key_final    = var.environment_key
  # Prefer explicit name_prefix, else environment_key
  name_prefix_effective    = var.name_prefix != "" ? var.name_prefix : var.environment_key
}

locals {
  frontdoor_profile_name_effective = var.frontdoor_profile_name
}

# Consolidated TXT values for domain validation tokens. We use try() so
# evaluation doesn't fail when the wildcard custom domain resource is not
# present (count = 0).
locals {
  txt_values = compact([
    try(azurerm_cdn_frontdoor_custom_domain.env_domain[0].validation_token, null),
    try(azurerm_cdn_frontdoor_custom_domain.rg_wildcard[0].validation_token, null)
  ])
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
  dynamic "record" {
    for_each = local.txt_values
    content {
      value = record.value
    }
  }
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

# =============================
# Wildcard subdomain -> APIM
# *.chemicalfirefly.<parent_domain> -> APIM origin via Front Door
# =============================

locals {
  # Align wildcard naming with non-wildcard: use environment_key-based prefix
  rg_wildcard_fqdn = "*.${local.environment_key_final}.${local.parent_domain_name_final}"
}

# Custom domain for wildcard
resource "azurerm_cdn_frontdoor_custom_domain" "rg_wildcard" {
  count                    = var.enable_custom_domain && var.enable_rg_wildcard && var.rg_apim_gateway_host != "" ? 1 : 0
  name                     = "${local.environment_key_final}-wildcard"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.central.id
  host_name                = local.rg_wildcard_fqdn

  tls {
    certificate_type = "ManagedCertificate"
  }
}

# DNS records for wildcard CNAME and TXT validation
resource "azurerm_dns_cname_record" "rg_wildcard_cname" {
  count               = var.enable_custom_domain && var.enable_rg_wildcard && var.rg_apim_gateway_host != "" ? 1 : 0
  name                = "*.${local.environment_key_final}"
  zone_name           = data.azurerm_dns_zone.zone[0].name
  resource_group_name = coalesce(var.dns_zone_resource_group, local.central_env_final)
  ttl                 = 3600
  record              = azurerm_cdn_frontdoor_endpoint.env.host_name
}

/* rg_wildcard_txt removed: TXT validation tokens are consolidated into `env_txt` as multiple record entries. */

# APIM origin group for wildcard traffic
resource "azurerm_cdn_frontdoor_origin_group" "rg_apim_group" {
  count                    = var.enable_rg_wildcard && var.rg_apim_gateway_host != "" ? 1 : 0
  name                     = "${local.environment_key_final}-apim-og"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.central.id

  health_probe {
    protocol            = "Https"
    path                = "/status"
    request_type        = "GET"
    interval_in_seconds = 60
  }

  load_balancing {
    sample_size                 = 4
    successful_samples_required = 3
  }
}

resource "azurerm_cdn_frontdoor_origin" "rg_apim_origin" {
  count                         = var.enable_rg_wildcard && var.rg_apim_gateway_host != "" ? 1 : 0
  name                          = "${local.environment_key_final}-apim-origin"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.rg_apim_group[0].id
  host_name                     = var.rg_apim_gateway_host
  origin_host_header            = var.rg_apim_gateway_host
  http_port                     = 80
  https_port                    = 443
  priority                      = 1
  weight                        = 1000
  enabled                       = true
  certificate_name_check_enabled = true
}

resource "azurerm_cdn_frontdoor_route" "rg_wildcard_to_apim" {
  count                           = var.enable_custom_domain && var.enable_rg_wildcard && var.rg_apim_gateway_host != "" ? 1 : 0
  name                            = "${local.environment_key_final}-wildcard-to-apim"
  cdn_frontdoor_endpoint_id       = azurerm_cdn_frontdoor_endpoint.env.id
  cdn_frontdoor_origin_group_id   = azurerm_cdn_frontdoor_origin_group.rg_apim_group[0].id
  cdn_frontdoor_origin_ids        = [azurerm_cdn_frontdoor_origin.rg_apim_origin[0].id]
  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.rg_wildcard[0].id]

  # Attach only to the wildcard custom domain to avoid conflicts
  link_to_default_domain  = false
  patterns_to_match       = ["/*"]
  supported_protocols     = ["Http", "Https"]
  forwarding_protocol     = "HttpsOnly"
  https_redirect_enabled  = true
}
