# -------------------------
# Traditional Event Grid Topic
# -------------------------
resource "azurerm_eventgrid_topic" "egtopic" {
  name                = var.event_grid_name
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  input_schema        = "CloudEventSchemaV1_0"

  identity {
    type = "SystemAssigned"
  }
}

# resource "azurerm_eventgrid_event_subscription" "example_std_sub" {
#   name  = "StandardTopicQueue"
#   scope = azurerm_eventgrid_topic.example_std_topic.id

#   webhook_endpoint {
#     url = "https://<your-function-app>.azurewebsites.net/runtime/webhooks/eventgrid?functionName=StdTopicQueue"
#   }
# }
resource "azurerm_role_assignment" "eg_data_contributor" {
  scope                = azurerm_eventgrid_topic.egtopic.id
  role_definition_name = "EventGrid Data Contributor"
  principal_id         = var.user_assigned_identity_principal_id
}
