
#----------------------------------

# used to create a vnet and subnet for private endpoints
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
  # Required so the storage account network_rules can reference this subnet
  # for network ACLs; without this Azure returns SubnetsHaveNoServiceEndpointsConfigured
  # service_endpoints    = ["Microsoft.Storage"]
}
resource "azurerm_storage_account" "website" {
  name                     = var.storage_account_web_name
  resource_group_name      = data.azurerm_resource_group.main_resource.name
  location                 = data.azurerm_resource_group.main_resource.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  # Restrict network access to the storage account
  # network_rules {
  #   default_action             = "Deny" # Deny all access by default
  # }
}

# Create a storage container for static web content
resource "azurerm_storage_container" "static_content" {
  name                  = "$web"
  storage_account_id    = azurerm_storage_account.website.id
  # Make the $web container private so direct blob URLs like
  # https://<account>.blob.core.windows.net/$web/index.html are blocked.
  # Front Door uses the static website endpoint (web.core.windows.net),
  # which continues to work regardless of this ACL.
  container_access_type = "private"  
}

resource "azurerm_storage_account_static_website" "website" {
  storage_account_id = azurerm_storage_account.website.id
  index_document     = "index.html"
  error_404_document = "index.html"  
}

# using Front Door Standard/Premium Private Link origin instead.
resource "azurerm_cdn_frontdoor_profile" "fd_profile" {
  name                = "${var.storage_account_web_name}-fd-profile"   
  resource_group_name = data.azurerm_resource_group.main_resource.name  
  # sku_name            = "Premium_AzureFrontDoor"
  sku_name            = "Standard_AzureFrontDoor"                       
  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_cdn_frontdoor_endpoint" "fd_endpoint" {
  name                     = "${var.storage_account_web_name}-fd-endpoint"
  cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id  
}

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
# creating domain name
resource "azurerm_cdn_frontdoor_custom_domain" "custom_domain" {
  name                        = "${var.target_env}-dns"
  cdn_frontdoor_profile_id    = azurerm_cdn_frontdoor_profile.fd_profile.id
  host_name                   = lower("${var.target_env}.zenblox.com.au")
  tls {
    certificate_type = "ManagedCertificate"
    }
}
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

# Rules Engine: force custom domain by redirecting requests whose Host != custom domain
resource "azurerm_cdn_frontdoor_rule_set" "fd_rules" {
  name                      = "${var.storage_account_web_name}ruleset"
  cdn_frontdoor_profile_id  = azurerm_cdn_frontdoor_profile.fd_profile.id
}

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

  # Configure Private Link directly on the Front Door origin to storage account blob subresource
  # private_link {
  #   request_message        = "Approve Front Door access to blob origin"
  #   target_type            = "blob"
  #   location               = data.azurerm_resource_group.main_resource.location
  #   private_link_target_id = azurerm_storage_account.website.id
  # }
}
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










