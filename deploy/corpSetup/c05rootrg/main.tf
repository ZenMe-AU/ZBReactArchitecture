#This script generates resource group, log analytics workspace and dns zone for corporate setup.

# create azurerm_resource_group and
resource "azurerm_resource_group" "root_rg" {
    name     = var.resource_group_name
    location = var.location
}

# Configure log analytics
resource "azurerm_log_analytics_workspace" "log_analytics_workspace" {
  name                = var.log_analytics_workspace_name
  location            = azurerm_resource_group.root_rg.location
  resource_group_name = azurerm_resource_group.root_rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}


resource "azurerm_monitor_diagnostic_setting" "activity_log_diagnostics" {
  name               = "standard-diagnostics-setting"
  target_resource_id = "/subscriptions/${var.subscription_id}"

  log_analytics_workspace_id = azurerm_log_analytics_workspace.log_analytics_workspace.id
  # Enable specific log categories
  enabled_log {
    category = "Administrative"
  }
  enabled_log {
    category = "Security"
  }
}

# create dns
resource "azurerm_dns_zone" "dns_zone" {
  name                = var.dns_name
  resource_group_name = azurerm_resource_group.root_rg.name
}
