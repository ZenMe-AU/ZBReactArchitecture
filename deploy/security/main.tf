
#----------------------------------
resource "azurerm_storage_account" "website" {
  name                     = var.storage_account_web_name
  resource_group_name      = data.azurerm_resource_group.main_resource.name
  location                 = data.azurerm_resource_group.main_resource.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Create a storage container for static web content
resource "azurerm_storage_container" "static_content" {
  name                  = "$web"
  storage_account_id    = azurerm_storage_account.website.id
  container_access_type = "blob"
}

resource "azurerm_storage_account_static_website" "website" {
  storage_account_id = azurerm_storage_account.website.id
  index_document     = "index.html"
  error_404_document = "index.html"
}
resource "azurerm_cdn_frontdoor_profile" "fd_profile" {
  name                = "${var.storage_account_web_name}-fd-profile"   
  resource_group_name = data.azurerm_resource_group.main_resource.name  
  sku_name            = "Standard_AzureFrontDoor"                     
}



resource "azurerm_cdn_frontdoor_endpoint" "fd_endpoint" {
  name                     = "${var.storage_account_web_name}-fd-endpoint"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id  
}

resource "azurerm_cdn_frontdoor_origin" "fd_origin" {
  name                          = "${var.storage_account_web_name}-fd-origin"
  cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.fd_origin_group.id
  host_name = replace(replace(azurerm_storage_account.website.primary_web_endpoint, "https://", ""), "/", "")
  enabled                       = true
  http_port                     = 80
  https_port                    = 443
  origin_host_header = replace(replace(azurerm_storage_account.website.primary_web_endpoint, "https://", ""), "/", "")
  certificate_name_check_enabled = true

  private_link {
    request_message        = "Request access for Private Link Origin CDN Frontdoor"
    target_type            = "Microsoft.Cdn/frontDoors/origins"
    location               = data.azurerm_resource_group.main_resource.location
    private_link_target_id = azurerm_private_endpoint.private_endpoint.id
  }
}

resource "azurerm_cdn_frontdoor_origin_group" "fd_origin_group" {
  name                = "${var.storage_account_web_name}-fd-origin"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id

  session_affinity_enabled = false

  health_probe {
    interval_in_seconds = 30
    path                = "/"
    protocol            = "Https"
    request_type        = "HEAD"
  }

  load_balancing {
    sample_size                     = 4
    successful_samples_required      = 2
  }
}
resource "azurerm_cdn_frontdoor_route" "fd_route" {
  name                              = "${var.storage_account_web_name}-fd-route"
  cdn_frontdoor_endpoint_id         = azurerm_cdn_frontdoor_endpoint.fd_endpoint.id
  cdn_frontdoor_origin_ids          = [azurerm_cdn_frontdoor_origin.fd_origin.id]
  cdn_frontdoor_origin_group_id     = azurerm_cdn_frontdoor_origin_group.fd_origin_group.id
  patterns_to_match                 = ["/*"]
  supported_protocols               = ["Http", "Https"]
  forwarding_protocol               = "HttpsOnly"
  // The 'https_redirect_enabled' field cannot be set to 'true' 
  // unless the 'supported_protocols' field contains both 'Http' and 'Https'
  https_redirect_enabled            = true

  # Associate the custom domain with the Front Door endpoint
  cdn_frontdoor_custom_domain_ids = [
    azurerm_cdn_frontdoor_custom_domain.custom_domain.id
  ]

  # Ensure the route is created after the custom domain and DNS records
  depends_on = [
    azurerm_dns_txt_record.dns_validation,
    azurerm_dns_cname_record.cname_record
  ]
}

#----------------------------------
# creating domain name
resource "azurerm_cdn_frontdoor_custom_domain" "custom_domain" {
  name                        = "${var.target_env}-dns"
  cdn_frontdoor_profile_id    = azurerm_cdn_frontdoor_profile.fd_profile.id
  host_name                   = "${var.target_env}.zenblox.com.au"
  tls {
    certificate_type = "ManagedCertificate"
    
  }
}
#this code should help make certification for the custom domain work
#creates dns validation:
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

resource "azurerm_private_endpoint" "private_endpoint" {
  name                = "${var.storage_account_web_name}-privendpoint"
  location            = data.azurerm_resource_group.main_resource.location
  resource_group_name = data.azurerm_resource_group.main_resource.name
  subnet_id           = azurerm_subnet.private_endpoint_subnet.id

  private_service_connection {
    name                           = "${var.storage_account_web_name}-privateserviceconnection"
    private_connection_resource_id = azurerm_cdn_frontdoor_origin.fd_origin.id
    is_manual_connection           = false
  }
}

resource "azurerm_virtual_network" "virtual_network" {
  name                = "${var.storage_account_web_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = data.azurerm_resource_group.main_resource.location
  resource_group_name = data.azurerm_resource_group.main_resource.name
}

resource "azurerm_subnet" "private_endpoint_subnet" {
  name                 = "${var.storage_account_web_name}-privatesubnet"
  resource_group_name  = data.azurerm_resource_group.main_resource.name
  virtual_network_name = azurerm_virtual_network.virtual_network.name
  address_prefixes     = ["10.0.1.0/24"]
}

