# API inside APIM

// This file relies on the module-level `var.target_env` provided by ingress

variable "apim_management_name" {
  type    = string
  default = ""
  description = "Name of the existing API Management instance (leave empty to skip creating APIs)"
}

variable "apim_resource_group_name" {
  type    = string
  default = ""
  description = "Resource group of the existing API Management instance (leave empty to skip creating APIs)"
}

resource "azurerm_api_management_api" "profile_api" {
  count = (var.apim_management_name != "" && var.apim_resource_group_name != "") ? 1 : 0
  name                = "profile-api"
  resource_group_name = var.apim_resource_group_name
  api_management_name = var.apim_management_name

  revision            = "1"
  display_name        = "Profile API"
  path                = "profile"
  protocols           = ["https"]

  # Simple backend service URL
  service_url = "https://${var.target_env}-profile-func.azurewebsites.net"
}
resource "azurerm_api_management_api" "quest3Tier_api" {
  count = (var.apim_management_name != "" && var.apim_resource_group_name != "") ? 1 : 0
  name                = "quest3Tier-api"
  resource_group_name = var.apim_resource_group_name
  api_management_name = var.apim_management_name

  revision            = "1"
  display_name        = "Quest 3 Tier API"
  path                = "quest3tier"
  protocols           = ["https"]

  # Simple backend service URL
  service_url = "https://${var.target_env}-quest3tier-func.azurewebsites.net"
}

resource "azurerm_api_management_api" "quest5Tier_api" {
  count = (var.apim_management_name != "" && var.apim_resource_group_name != "") ? 1 : 0
  name                = "quest5Tier-api"
  resource_group_name = var.apim_resource_group_name
  api_management_name = var.apim_management_name

  revision            = "1"
  display_name        = "Quest 5 Tier API"
  path                = "quest5tier"
  protocols           = ["https"]

  # Simple backend service URL
  service_url = "https://${var.target_env}-quest5tier-func.azurewebsites.net"
}