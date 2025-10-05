# -------------------------
# Traditional Event Grid Topic
# -------------------------
# resource "azurerm_eventgrid_topic" "egtopic" {
#   for_each            = { for t in var.topics : t.name => t }
#   name                = each.value.name
#   location            = var.resource_group_location
#   resource_group_name = var.resource_group_name
# }

# resource "azurerm_eventgrid_event_subscription" "example_std_sub" {
#   name  = "StandardTopicQueue"
#   scope = azurerm_eventgrid_topic.example_std_topic.id

#   webhook_endpoint {
#     url = "https://<your-function-app>.azurewebsites.net/runtime/webhooks/eventgrid?functionName=StdTopicQueue"
#   }
# }
