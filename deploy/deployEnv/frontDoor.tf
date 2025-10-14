# Create an Azure Front Door to securely host the website

# The profile is the top-level resource for Front Door
resource "azurerm_cdn_frontdoor_profile" "fd_profile" {
  name                = "${var.target_env}-fd-profile"   
  resource_group_name = data.azurerm_resource_group.rg.name  
  # sku_name            = "Premium_AzureFrontDoor"
  sku_name            = "Standard_AzureFrontDoor"                       
  identity {
    type = "SystemAssigned"
  }
}

# Resource group and DNS zone for the public domain
# Use existing DNS resource group and zone instead of creating them
data "azurerm_resource_group" "dns_rg" {
  name = var.dns_resource_group_name
}

data "azurerm_dns_zone" "dns_zone" {
  name                = var.parent_domain_name
  resource_group_name = data.azurerm_resource_group.dns_rg.name
}

# Main entry point into Front Door
resource "azurerm_cdn_frontdoor_endpoint" "fd_endpoint" {
  name                     = "${var.target_env}-fd-endpoint"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id  
}


# creating domain with environment name
resource "azurerm_cdn_frontdoor_custom_domain" "custom_domain" {
  name                        = "${var.target_env}-dns"
  cdn_frontdoor_profile_id    = azurerm_cdn_frontdoor_profile.fd_profile.id
  host_name                   = lower("${var.target_env}.${data.azurerm_dns_zone.dns_zone.name}")
  tls {
    certificate_type = "ManagedCertificate"
    }
}

# Enable custom domain by adding txt record to dns zone
resource "azurerm_dns_txt_record" "dns_validation" {
  count               = var.manage_dns_txt_validation ? 1 : 0
  name                = "_dnsauth.${var.target_env}"
  zone_name           = data.azurerm_dns_zone.dns_zone.name
  resource_group_name = data.azurerm_resource_group.dns_rg.name
  ttl                 = 3600
  record {
    value = azurerm_cdn_frontdoor_custom_domain.custom_domain.validation_token
  }
}

# creates cname record to point to front door endpoint
resource "azurerm_dns_cname_record" "cname_record" {
  count               = var.manage_dns_cname ? 1 : 0
  name                = var.target_env
  zone_name           = data.azurerm_dns_zone.dns_zone.name
  resource_group_name = data.azurerm_resource_group.dns_rg.name
  ttl                 = 3600
  record              = azurerm_cdn_frontdoor_endpoint.fd_endpoint.host_name
}

# Publish the frontend custom domain host to App Configuration for runtime use by UI
resource "azurerm_app_configuration_key" "frontend_custom_domain_host" {
  configuration_store_id = data.azurerm_app_configuration.appconfig.id
  key                    = "Frontend:CustomDomainHost"
  label                  = var.env_type
  value                  = lower("${var.target_env}.${data.azurerm_dns_zone.dns_zone.name}")
  # The key only needs the custom domain to exist; TXT record may be managed externally
  depends_on             = [azurerm_cdn_frontdoor_custom_domain.custom_domain]
}

# Helpful outputs for DNS delegation and verification
output "dns_zone_name" {
  value       = data.azurerm_dns_zone.dns_zone.name
  description = "DNS zone managed by Terraform"
}

output "dns_zone_name_servers" {
  value       = data.azurerm_dns_zone.dns_zone.name_servers
  description = "Azure DNS nameservers to delegate at your domain registrar"
}

output "frontdoor_endpoint_host" {
  value       = azurerm_cdn_frontdoor_endpoint.fd_endpoint.host_name
  description = "Front Door endpoint hostname used by the CNAME"
}

output "custom_domain_txt_name" {
  value       = "_dnsauth.${var.target_env}.${data.azurerm_dns_zone.dns_zone.name}"
  description = "TXT record name used for Front Door certificate validation"
}

