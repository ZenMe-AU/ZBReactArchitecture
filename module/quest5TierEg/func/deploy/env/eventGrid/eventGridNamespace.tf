# -------------------------
# Event Grid Namespace
# -------------------------
resource "azurerm_eventgrid_namespace" "egns" {
  name                = var.event_grid_name
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name

  # tags = {
  #   environment = var.env_type
  # }

  # identity {
  #   identity_ids = ["/subscriptions/0930d9a7-2369-4a2d-a0b6-5805ef505868/resourceGroups/dev-hugejunglefowl/providers/Microsoft.ManagedIdentity/userAssignedIdentities/hugejunglefowl-identity"]
  #   type         = "SystemAssigned, UserAssigned"
  # }

}
