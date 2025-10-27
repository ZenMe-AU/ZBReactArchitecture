#
# @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
# @license SPDX-License-Identifier: MIT
#

# Wires module Function App into the existing shared Azure Front Door.
# Adds origin group, origin, custom domain + DNS (TXT/CNAME), rules, and route.

# Authoritative DNS zone where CNAME + TXT will be created
data "azurerm_dns_zone" "main_dns_zone" {
  name                = var.parent_domain_name
  resource_group_name = var.dns_resource_group_name
}

# Function App lookup (by name)
data "azurerm_linux_function_app" "module_func" {
  name                = var.function_app_name
  resource_group_name = var.resource_group_name
}

# Reuse shared Front Door profile + endpoint
data "azurerm_cdn_frontdoor_profile" "shared_profile" {
  name                = var.frontdoor_profile_name
  resource_group_name = var.resource_group_name
}

data "azurerm_cdn_frontdoor_endpoint" "shared_endpoint" {
  name                = var.frontdoor_endpoint_name
  profile_name        = data.azurerm_cdn_frontdoor_profile.shared_profile.name
  resource_group_name = var.resource_group_name
}

# Origin Group (health probe to /api/health)
resource "azurerm_cdn_frontdoor_origin_group" "module_fd_origin_group" {
  name                     = "${var.function_app_name}-og"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared_profile.id
  session_affinity_enabled = false

  load_balancing {
    sample_size                 = 4
    successful_samples_required = 2
  }

  health_probe {
    interval_in_seconds = 240
    path                = "/api/health"
    protocol            = "Https"
    request_type        = "GET"
  }
}

# Origin pointing at the Function App default hostname
resource "azurerm_cdn_frontdoor_origin" "module_fd_origin" {
  name                          = "${var.function_app_name}-orig"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.module_fd_origin_group.id

  enabled                        = true
  host_name                      = data.azurerm_linux_function_app.module_func.default_hostname
  origin_host_header             = data.azurerm_linux_function_app.module_func.default_hostname
  https_port                     = 443
  certificate_name_check_enabled = true
}

# Front Door Custom Domain (managed cert)
resource "azurerm_cdn_frontdoor_custom_domain" "module_custom_domain" {
  name                     = lower("${var.module_name}-${var.target_env}-domain")
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared_profile.id
  dns_zone_id              = data.azurerm_dns_zone.main_dns_zone.id
  # Desired host: module.<env>.<parent domain>
  host_name = lower("${var.module_name}.${var.target_env}.${var.parent_domain_name}")
  tls { certificate_type = "ManagedCertificate" }

  lifecycle {
    create_before_destroy = true
  }
}

# DNS TXT record for certificate validation
resource "azurerm_dns_txt_record" "module_dns_validation" {
  # _dnsauth.module.<env>
  name                = "_dnsauth.${lower(var.module_name)}.${var.target_env}"
  zone_name           = data.azurerm_dns_zone.main_dns_zone.name
  resource_group_name = var.dns_resource_group_name
  ttl                 = 3600

  record { value = azurerm_cdn_frontdoor_custom_domain.module_custom_domain.validation_token }
}

# DNS CNAME -> Front Door endpoint
resource "azurerm_dns_cname_record" "module_cname_record" {
  # module.<env>
  name                = "${lower(var.module_name)}.${var.target_env}"
  zone_name           = data.azurerm_dns_zone.main_dns_zone.name
  resource_group_name = var.dns_resource_group_name
  ttl                 = 3600
  record              = data.azurerm_cdn_frontdoor_endpoint.shared_endpoint.host_name
}

# Ruleset to enforce canonical host
resource "azurerm_cdn_frontdoor_rule_set" "module_fd_rules" {
  # Rule set names must be 1-60 chars, start with a letter, and contain only letters and numbers
  # Sanitize by removing hyphens and lowercasing (function app names don't include other special chars)
  name                     = lower("${replace(var.function_app_name, "-", "")}ruleset")
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared_profile.id
}

resource "azurerm_cdn_frontdoor_rule" "module_enforce_custom_host" {
  depends_on = [
    azurerm_dns_txt_record.module_dns_validation,
    azurerm_dns_cname_record.module_cname_record
  ]

  # Rule names follow similar constraints: keep alphanumeric (remove hyphens)
  name                      = lower("${replace(var.function_app_name, "-", "")}enforcehost")
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.module_fd_rules.id
  order                     = 1
  behavior_on_match         = "Continue"

  conditions {
    host_name_condition {
      operator         = "Equal"
      negate_condition = true
      match_values     = [lower("${var.module_name}.${var.target_env}.${var.parent_domain_name}")]
      transforms       = []
    }
  }

  actions {
    url_redirect_action {
      redirect_type        = "PermanentRedirect"
      redirect_protocol    = "Https"
      destination_hostname = lower("${var.module_name}.${var.target_env}.${var.parent_domain_name}")
      destination_path     = "/{path}"
      destination_fragment = "{fragment}"
      query_string         = "{query_string}"
    }
  }
}

# Route binding custom domain + origin to shared endpoint
resource "azurerm_cdn_frontdoor_route" "module_fd_route" {
  depends_on = [
    azurerm_dns_txt_record.module_dns_validation,
    azurerm_dns_cname_record.module_cname_record
  ]

  name                            = "${var.function_app_name}-route"
  cdn_frontdoor_endpoint_id       = data.azurerm_cdn_frontdoor_endpoint.shared_endpoint.id
  cdn_frontdoor_origin_group_id   = azurerm_cdn_frontdoor_origin_group.module_fd_origin_group.id
  cdn_frontdoor_origin_ids        = [azurerm_cdn_frontdoor_origin.module_fd_origin.id]
  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.module_custom_domain.id]
  cdn_frontdoor_rule_set_ids      = [azurerm_cdn_frontdoor_rule_set.module_fd_rules.id]

  supported_protocols = ["Https"]
  patterns_to_match   = ["/*"]
  forwarding_protocol = "HttpsOnly"
  # Avoid conflicting with existing catch-all route on the endpoint's default domain
  link_to_default_domain = false
  https_redirect_enabled = false
}
