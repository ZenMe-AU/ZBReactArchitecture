# Create an Azure Front Door to securely host the website

# Main entry point into Front Door
data "azurerm_cdn_frontdoor_endpoint" "fd_endpoint" {
  name = "${var.target_env}-fd-endpoint"
  profile_name                = "${var.target_env}-fd-profile"
  resource_group_name = data.azurerm_resource_group.main_resource.name
}

# define how traffic is prioritized to each origin
resource "azurerm_cdn_frontdoor_origin_group" "ui_fdog" {
  name                = "${var.target_env}-ui-fdog"
  cdn_frontdoor_profile_id = data.azurerm_cdn_frontdoor_profile.fd_profile.id
  session_affinity_enabled = false
  health_probe {
    interval_in_seconds = 30
    path                = "/index.html"
    protocol            = "Https"
    request_type        = "GET"
  }

  load_balancing {
    sample_size                     = 4
    successful_samples_required      = 2
  }
}

# Enable custom domain by adding txt record to dns zone
resource "azurerm_dns_txt_record" "dns_validation" {
  name                = "_dnsauth.${var.target_env}"
  zone_name           = var.parent_domain_name
  resource_group_name = "root-zenblox"
  ttl                 = 3600
  record {
    value = azurerm_cdn_frontdoor_custom_domain.ui_custom_domain.validation_token
  }
}

# creating domain with environment name
resource "azurerm_cdn_frontdoor_custom_domain" "ui_custom_domain" {
  name                        = "${var.target_env}-dns"
  cdn_frontdoor_profile_id    = data.azurerm_cdn_frontdoor_profile.fd_profile.id
  host_name                   = lower("www.${var.parent_domain_name}") # change this (www.) for other subdomains
  tls {
    certificate_type = "ManagedCertificate"
    }
}

# Redirecting requests whose Host != custom domain
resource "azurerm_cdn_frontdoor_rule_set" "fd_rules" {
  name                      = "${var.storage_account_web_name}ruleset"
  cdn_frontdoor_profile_id  = data.azurerm_cdn_frontdoor_profile.fd_profile.id
}

# creates cname record to point to front door endpoint
resource "azurerm_dns_cname_record" "cname_record" {
  name                = var.target_env
  zone_name           = var.parent_domain_name
  resource_group_name = data.azurerm_resource_group.main_resource.name
  ttl                 = 3600
  record              = data.azurerm_cdn_frontdoor_endpoint.fd_endpoint.host_name
}

# Origin to point to the static website that is being published by Front Door
resource "azurerm_cdn_frontdoor_origin" "ui_fdo" {
  name                          = "${var.target_env}-ui-fdog"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.ui_fdog.id
  host_name                     = azurerm_storage_account.website.primary_web_host
  enabled                       = true
  https_port                    = 443
  origin_host_header            = azurerm_storage_account.website.primary_web_host
  certificate_name_check_enabled = true
}

# Connect the endpoint to the origin and apply rules
resource "azurerm_cdn_frontdoor_route" "fd_route" {
  name                              = "${var.target_env}-fd-route"
  cdn_frontdoor_endpoint_id         = data.azurerm_cdn_frontdoor_endpoint.fd_endpoint.id
  cdn_frontdoor_origin_ids          = [azurerm_cdn_frontdoor_origin.fd_origin.id]
  cdn_frontdoor_origin_group_id     = azurerm_cdn_frontdoor_origin_group.ui_fdog.id
  cdn_frontdoor_rule_set_ids        = [azurerm_cdn_frontdoor_rule_set.fd_rules.id]
  patterns_to_match                 = ["/*"]
  supported_protocols               = ["Https"]
  forwarding_protocol               = "HttpsOnly"
  link_to_default_domain            = true
  https_redirect_enabled            = false
  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.custom_domain.id] # Associate the custom domain with the Front Door endpoint
  depends_on = [azurerm_dns_txt_record.dns_validation, azurerm_dns_cname_record.cname_record] # Ensure the route is created after the custom domain and DNS records
}