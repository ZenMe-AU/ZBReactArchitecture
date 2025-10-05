#############################################
# quest5tier API Front Door (Shared Profile) #
#############################################
# This file wires the quest5tier Function App into the existing shared
# Azure Front Door profile + endpoint used by the platform (created elsewhere).
# We only add: an origin group, an origin, a custom domain + DNS, a rule set
# for host enforcement, and a route binding them together.
#
# Key design decisions:
# - Single Front Door profile keeps cost low and centralizes edge policy.
# - Health probe points to /api/health (must return 200 fast + unauthenticated).
# - Rules engine permanently redirects any request not using the custom host
#   quest5tier-api-<env>.<parent_domain_name> to that host (SEO + canonical).
# - We propagate original path/query via token substitution ({path}, {query_string}).
# - link_to_default_domain = true so the azurefd.net host is also redirected.
# - DNS validation uses TXT + CNAME; managed cert is provisioned automatically.
#
# Dynamic naming: target_env comes from TF_VAR_target_env (.env TARGET_ENV).
# parent_domain_name & dns_resource_group_name are variable-driven to avoid hardcoding.


data "azurerm_dns_zone" "main_dns_zone" {
  # Load the authoritative DNS zone where CNAME + TXT will be created
  name                = var.parent_domain_name
  resource_group_name = var.dns_resource_group_name
}

# Function App (use variable for name)
data "azurerm_linux_function_app" "quest5tier_func" {
  name                = var.function_app_name
  resource_group_name = var.resource_group_name
}

# Reuse existing Front Door profile & endpoint (supplied by variables)
data "azurerm_cdn_frontdoor_profile" "shared_profile" {
  name                = var.frontdoor_profile_name
  resource_group_name = var.resource_group_name
}
data "azurerm_cdn_frontdoor_endpoint" "shared_endpoint" {
  name                = var.frontdoor_endpoint_name
  profile_name        = data.azurerm_cdn_frontdoor_profile.shared_profile.name
  resource_group_name = var.resource_group_name
}

# Origin Group for the Function App
resource "azurerm_cdn_frontdoor_origin_group" "quest5tier_fd_origin_group" {
  name                     = "${var.function_app_name}-og"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared_profile.id
  session_affinity_enabled = false

  load_balancing {
    sample_size                 = 4
    successful_samples_required = 2
  }

  health_probe {
    # 240s keeps cost lower; tighten to 60s for faster failure detection if needed.
    interval_in_seconds = 240
    path                = "/api/health"
    protocol            = "Https"
    request_type        = "GET"
  }
}

# Origin pointing to Function App
resource "azurerm_cdn_frontdoor_origin" "quest5tier_fd_origin" {
  # Single origin = Function App default hostname (public). Consider locking down later with ACLs or Premium + Private Link if needed.
  name                          = "${var.function_app_name}-orig"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.quest5tier_fd_origin_group.id

  enabled                        = true
  host_name                     = module.function_app.default_hostname
  origin_host_header            = module.function_app.default_hostname
  https_port                    = 443
  certificate_name_check_enabled = true
}

# Custom Domain for API (following UI pattern)
resource "azurerm_cdn_frontdoor_custom_domain" "quest5tier_custom_domain" {
  # Creates a managed TLS binding for quest5tier-api-<env>.<domain>
  name                     = "${var.function_app_name}-domain"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared_profile.id
  dns_zone_id              = data.azurerm_dns_zone.main_dns_zone.id
  host_name                = lower("${var.function_app_name}-api-${var.target_env}.${var.parent_domain_name}")
  tls { certificate_type = "ManagedCertificate" }
}

# DNS TXT record for domain validation (following UI pattern)
resource "azurerm_dns_txt_record" "quest5tier_dns_validation" {
  name                = "_dnsauth.${var.function_app_name}-api-${var.target_env}"
  zone_name           = data.azurerm_dns_zone.main_dns_zone.name
  resource_group_name = var.dns_resource_group_name
  ttl                 = 3600

  record {
    value = azurerm_cdn_frontdoor_custom_domain.quest5tier_custom_domain.validation_token
  }
}

# DNS CNAME record pointing to Front Door endpoint (following UI pattern)
resource "azurerm_dns_cname_record" "quest5tier_cname_record" {
  name                = "${var.function_app_name}-api-${var.target_env}"
  zone_name           = data.azurerm_dns_zone.main_dns_zone.name
  resource_group_name = var.resource_group_name
  ttl                 = 3600
  record              = data.azurerm_cdn_frontdoor_endpoint.shared_endpoint.host_name
}

# Rules Engine for security and routing (following UI pattern)
resource "azurerm_cdn_frontdoor_rule_set" "quest5tier_fd_rules" {
  # Container for one or more rules (we currently use a single redirect rule)
  name                     = "${var.function_app_name}-ruleset"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.shared_profile.id
}

# Rule to enforce custom domain usage (following UI pattern)
resource "azurerm_cdn_frontdoor_rule" "quest5tier_enforce_custom_host" {
  # Redirect any request whose Host header != canonical custom domain
  depends_on = [azurerm_dns_txt_record.quest5tier_dns_validation, azurerm_dns_cname_record.quest5tier_cname_record]

  name                      = "${var.function_app_name}EnforceHost"
  cdn_frontdoor_rule_set_id = azurerm_cdn_frontdoor_rule_set.quest5tier_fd_rules.id
  order                     = 1
  behavior_on_match         = "Continue"

  conditions {
    host_name_condition {
      operator          = "Equal"
      negate_condition  = true
      match_values      = [lower("${var.function_app_name}-api-${var.target_env}.${var.parent_domain_name}")]
      transforms        = []
    }
  }

  actions {
    url_redirect_action {
      redirect_type        = "PermanentRedirect"
      redirect_protocol    = "Https"
      destination_hostname = lower("${var.function_app_name}-api-${var.target_env}.${var.parent_domain_name}")
      destination_path     = "/{path}"
      destination_fragment = "{fragment}"
      query_string         = "{query_string}"
    }
  }
}

# Front Door Route (following UI pattern)
resource "azurerm_cdn_frontdoor_route" "quest5tier_fd_route" {
  # Binds the custom domain + origin group to the shared endpoint and applies the rule set.
  depends_on = [azurerm_dns_txt_record.quest5tier_dns_validation, azurerm_dns_cname_record.quest5tier_cname_record]

  name                          = "${var.function_app_name}-route"
  cdn_frontdoor_endpoint_id     = data.azurerm_cdn_frontdoor_endpoint.shared_endpoint.id
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.quest5tier_fd_origin_group.id
  cdn_frontdoor_origin_ids      = [azurerm_cdn_frontdoor_origin.quest5tier_fd_origin.id]
  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.quest5tier_custom_domain.id]
  cdn_frontdoor_rule_set_ids    = [azurerm_cdn_frontdoor_rule_set.quest5tier_fd_rules.id]

  supported_protocols    = ["Https"]
  patterns_to_match     = ["/*"]
  forwarding_protocol   = "HttpsOnly"
  link_to_default_domain = true
  https_redirect_enabled = false
}