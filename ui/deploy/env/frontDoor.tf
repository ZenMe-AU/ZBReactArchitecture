# Create an Azure Front Door to securely host the website

# The profile is the top-level resource for Front Door
resource "azurerm_cdn_frontdoor_profile" "fd_profile" {
  name                = "${var.storage_account_web_name}-fd-profile"   
  resource_group_name = data.azurerm_resource_group.main_resource.name  
  # sku_name            = "Premium_AzureFrontDoor"
  sku_name            = "Standard_AzureFrontDoor"                       
  identity {
    type = "SystemAssigned"
  }
}

# Main entry point into Front Door
resource "azurerm_cdn_frontdoor_endpoint" "fd_endpoint" {
  name                     = "${var.storage_account_web_name}-fd-endpoint"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id  
}

# define how traffic is prioritized to each origin
resource "azurerm_cdn_frontdoor_origin_group" "fd_origin_group" {
  name                = "${var.storage_account_web_name}-fd-origin"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id

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
# creating domain with environment name
resource "azurerm_cdn_frontdoor_custom_domain" "custom_domain" {
  name                        = "${var.target_env}-dns"
  cdn_frontdoor_profile_id    = azurerm_cdn_frontdoor_profile.fd_profile.id
  host_name                   = lower("${var.target_env}.zenblox.com.au")
  tls {
    certificate_type = "ManagedCertificate"
    }
}
# Enable custom domain by adding txt record to dns zone
resource "azurerm_dns_txt_record" "dns_validation" {
  name                = "_dnsauth.${var.target_env}"
  zone_name           = "zenblox.com.au"
  resource_group_name = "root-zenblox"
  ttl                 = 3600
  record {
    value = azurerm_cdn_frontdoor_custom_domain.custom_domain.validation_token
  }
}

# Redirecting requests whose Host != custom domain
resource "azurerm_cdn_frontdoor_rule_set" "fd_rules" {
  name                      = "${var.storage_account_web_name}ruleset"
  cdn_frontdoor_profile_id  = azurerm_cdn_frontdoor_profile.fd_profile.id
}

# Enforce custom domain
resource "azurerm_cdn_frontdoor_rule" "enforce_custom_host" {
  name                        = "${var.storage_account_web_name}EnforceCustomHost"
  cdn_frontdoor_rule_set_id   = azurerm_cdn_frontdoor_rule_set.fd_rules.id
  order                       = 1
  conditions {
    host_name_condition {
      operator          = "Equal"
      match_values      = [lower("${var.target_env}.zenblox.com.au")]
      negate_condition  = true
      transforms        = []
    }
  }
  actions {
    url_redirect_action {
      redirect_type      = "PermanentRedirect"  # 308
      destination_hostname = lower("${var.target_env}.zenblox.com.au")
      destination_path   = "/{path}"
      destination_fragment = "{fragment}"
      query_string       = "{query_string}"
      redirect_protocol  = "Https"
    }
  }
}

# creates cname record to point to front door endpoint
resource "azurerm_dns_cname_record" "cname_record" {
  name                = var.target_env
  zone_name           = "zenblox.com.au"
  resource_group_name = "root-zenblox"
  ttl                 = 3600
  record              = azurerm_cdn_frontdoor_endpoint.fd_endpoint.host_name
}

# Origin to point to the static website that is being published by Front Door
resource "azurerm_cdn_frontdoor_origin" "fd_origin" {
  name                          = "${var.storage_account_web_name}-fd-origin"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.fd_origin_group.id
  # Lowest-cost: point to the Storage Static Website public endpoint
  host_name                     = azurerm_storage_account.website.primary_web_host
  enabled                       = true
  http_port                     = 80
  https_port                    = 443
  origin_host_header            = azurerm_storage_account.website.primary_web_host
  certificate_name_check_enabled = true
}

# Connect the endpoint to the origin and apply rules
resource "azurerm_cdn_frontdoor_route" "fd_route" {
  name                              = "${var.storage_account_web_name}-fd-route"
  cdn_frontdoor_endpoint_id         = azurerm_cdn_frontdoor_endpoint.fd_endpoint.id
  cdn_frontdoor_origin_ids          = [azurerm_cdn_frontdoor_origin.fd_origin.id]
  cdn_frontdoor_origin_group_id     = azurerm_cdn_frontdoor_origin_group.fd_origin_group.id
  cdn_frontdoor_rule_set_ids        = [azurerm_cdn_frontdoor_rule_set.fd_rules.id]
  patterns_to_match                 = ["/*"]
  supported_protocols               = ["Http", "Https"]
  forwarding_protocol               = "HttpsOnly"
  link_to_default_domain            = true
  https_redirect_enabled            = true # requires both Http and Https in supported_protocols
  cdn_frontdoor_custom_domain_ids = [azurerm_cdn_frontdoor_custom_domain.custom_domain.id] # Associate the custom domain with the Front Door endpoint
  depends_on = [azurerm_dns_txt_record.dns_validation, azurerm_dns_cname_record.cname_record] # Ensure the route is created after the custom domain and DNS records
}