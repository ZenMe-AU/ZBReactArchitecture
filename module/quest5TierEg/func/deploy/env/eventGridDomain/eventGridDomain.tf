
resource "azurerm_eventgrid_domain" "egdomain" {
  name                = var.event_grid_name
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  input_schema        = "CloudEventSchemaV1_0"

  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_eventgrid_domain_topic" "egdomain_topic" {
  for_each            = toset(var.event_grid_topic_list)
  name                = each.key
  domain_name         = azurerm_eventgrid_domain.egdomain.name
  resource_group_name = var.resource_group_name
}
