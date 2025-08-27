terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      //version = "~> 4.0"
      version = "4.41.0"
    }
  }
  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
  subscription_id = "0930d9a7-2369-4a2d-a0b6-5805ef505868"
}

# Create a resource group for this environment
resource "azurerm_resource_group" "rg" {
  name     = "ryanTest"
  location = "australiaeast"
}

# Create a Front Door Standard/Premium profile
resource "azurerm_frontdoor_profile" "fd_profile" {
  name                = "ryanTestFrontDoorProfile"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku_name            = "Standard_AzureFrontDoor"
}

# Create a Front Door endpoint
resource "azurerm_frontdoor_endpoint" "fd_endpoint" {
  name                     = "ryantestfrontdoor"
  frontdoor_profile_id     = azurerm_frontdoor_profile.fd_profile.id
}

# Create an origin group (backend pool)
resource "azurerm_frontdoor_origin_group" "fd_origin_group" {
  name                = "default-origin-group"
  frontdoor_profile_id = azurerm_frontdoor_profile.fd_profile.id

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
    additional_latency_milliseconds = 0
  }
}

# Create an origin (backend)
resource "azurerm_frontdoor_origin" "fd_origin" {
  name                    = "salmon-ground-staticapp"
  frontdoor_origin_group_id = azurerm_frontdoor_origin_group.fd_origin_group.id
  host_name               = "salmon-ground-01f879d1e.5.azurestaticapps.net"
  enabled                 = true
  http_port               = 80
  https_port              = 443
  origin_host_header      = "salmon-ground-01f879d1e.5.azurestaticapps.net"
}

# Create a route (routing rule)
resource "azurerm_frontdoor_route" "fd_route" {
  name                      = "DefaultRoutingRule"
  frontdoor_profile_id      = azurerm_frontdoor_profile.fd_profile.id
  frontend_endpoints        = [azurerm_frontdoor_endpoint.fd_endpoint.id]
  patterns_to_match         = ["/*"]
  supported_protocols       = ["Https"]
  forwarding_protocol       = "MatchRequest"
  forwarding_enabled        = true
  origin_group_id           = azurerm_frontdoor_origin_group.fd_origin_group.id
  # You can add more settings as needed
}