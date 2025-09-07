# terraform {
#   required_providers {
#     azurerm = {
#       source  = "hashicorp/azurerm"
#       //version = "~> 4.0"
#       version = "4.41.0"
#     }
#   }
#   required_version = ">= 1.1.0"
# }

# provider "azurerm" {
#   features {}
#   subscription_id = "0930d9a7-2369-4a2d-a0b6-5805ef505868"
# }

# # Create a resource group for this environment
# data "azurerm_resource_group" "rg" {
#   name     = "ryanTest"
# #  location = "australiaeast"
# }

# # Create a Front Door Standard/Premium profile
# resource "azurerm_cdn_frontdoor_profile" "fd_profile" {
#   name                = "ryanTestFrontDoorProfile"
#   resource_group_name = data.azurerm_resource_group.rg.name
#   sku_name            = "Standard_AzureFrontDoor"

#   identity {
#     type = "SystemAssigned"
#   }
# }

# # Create a Front Door endpoint
# resource "azurerm_cdn_frontdoor_endpoint" "fd_endpoint" {
#   name                     = "ryantestfrontdoor"
#   cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id
# }

# # Create an origin group (backend pool)
# resource "azurerm_cdn_frontdoor_origin_group" "fd_origin_group" {
#   name                = "default-origin-group"
#   cdn_frontdoor_profile_id = azurerm_cdn_frontdoor_profile.fd_profile.id

#   session_affinity_enabled = false

#   health_probe {
#     interval_in_seconds = 30
#     path                = "/"
#     protocol            = "Https"
#     request_type        = "HEAD"
#   }

#   load_balancing {
#     sample_size                     = 4
#     successful_samples_required      = 2
#   }
# }

# # Create an origin (backend)
# resource "azurerm_cdn_frontdoor_origin" "fd_origin" {
#   name                          = "salmon-ground-staticapp"
#   cdn_frontdoor_origin_group_id = azurerm_cdn_frontdoor_origin_group.fd_origin_group.id
#   host_name                     = "salmon-ground-01f879d1e.5.azurestaticapps.net"
#   enabled                       = true
#   http_port                     = 80
#   https_port                    = 443
#   origin_host_header            = "salmon-ground-01f879d1e.5.azurestaticapps.net"
#   certificate_name_check_enabled = true
# }

# data "azurerm_static_site" "swa" {
#   name                = "ZenmeChatPOC1"
#   resource_group_name = "ZenmeChatPOC1_group"
# }

# # Create a route (routing rule)
# resource "azurerm_cdn_frontdoor_route" "fd_route" {
#   name                              = "DefaultRoutingRule"
#   cdn_frontdoor_endpoint_id         = azurerm_cdn_frontdoor_endpoint.fd_endpoint.id
#   cdn_frontdoor_origin_ids          = [azurerm_cdn_frontdoor_origin.fd_origin.id]
#   cdn_frontdoor_origin_group_id     = azurerm_cdn_frontdoor_origin_group.fd_origin_group.id
#   patterns_to_match                 = ["/*"]
#   supported_protocols               = ["Https"]
#   forwarding_protocol               = "MatchRequest"
#   // The 'https_redirect_enabled' field cannot be set to 'true' 
#   // unless the 'supported_protocols' field contains both 'Http' and 'Https'
#   https_redirect_enabled            = false
# }

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
}

