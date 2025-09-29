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

# Main entry point into Front Door
resource "azurerm_cdn_frontdoor_endpoint" "fd_endpoint" {
  name                     = "${var.target_env}-fd-endpoint"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id  
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

# creates cname record to point to front door endpoint
resource "azurerm_dns_cname_record" "cname_record" {
  name                = var.target_env
  zone_name           = "zenblox.com.au"
  resource_group_name = "root-zenblox"
  ttl                 = 3600
  record              = azurerm_cdn_frontdoor_endpoint.fd_endpoint.host_name
}

