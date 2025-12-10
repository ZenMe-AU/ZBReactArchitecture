terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0"
    }
  }
  required_version = ">= 1.4.0"
}

provider "azurerm" {
  features {}
}

variable "central_env" {
  type        = string
  description = "Central resource group name (typically from deploy/central.env CENTRAL_ENV)"
  default     = ""
  validation {
    condition     = length(var.central_env) > 0
    error_message = "central_env must be provided."
  }
}

# Name of the central Front Door profile (shared by all environments)
variable "frontdoor_profile_name" {
  type        = string
  description = "Central Front Door profile name"
  default     = "FrontDoor"
}

# SKU: Standard_AzureFrontDoor or Premium_AzureFrontDoor
variable "frontdoor_sku_name" {
  type        = string
  description = "Front Door SKU name"
  default     = "Standard_AzureFrontDoor"
}

data "azurerm_resource_group" "central" {
  name = var.central_env
}

resource "azurerm_cdn_frontdoor_profile" "central" {
  name                = var.frontdoor_profile_name
  resource_group_name = data.azurerm_resource_group.central.name
  sku_name            = var.frontdoor_sku_name

  identity {
    type = "SystemAssigned"
  }

  timeouts {
    create = "60m"
    update = "60m"
    delete = "60m"
  }
}

output "frontdoor_profile_id" {
  description = "ID of the central Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.central.id
}

output "frontdoor_profile_name" {
  description = "Name of the central Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.central.name
}

