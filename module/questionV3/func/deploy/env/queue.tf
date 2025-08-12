# Get the Service Bus Namespace
data "azurerm_servicebus_namespace" "sb" {
  name                = "${var.target_env}-sbnamespace"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# Create Role Assignments
resource "azurerm_role_assignment" "servicebus_sender" {
  scope                = data.azurerm_servicebus_namespace.sb.id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = azurerm_linux_function_app.fa.identity[0].principal_id
}

resource "azurerm_role_assignment" "servicebus_receiver" {
  scope                = data.azurerm_servicebus_namespace.sb.id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = azurerm_linux_function_app.fa.identity[0].principal_id
}


# # Move to CI/CD Pipeline
# variable "queue_list" {
#   type    = list(string)
#   default = [
#     "sendFollowUp",
#     "shareQuestion",
#     "createQuestion",
#     "updateQuestion",
#     "createAnswer"
#   ]
# }
# # Create Service Bus Queues
# resource "azurerm_servicebus_queue" "queue" {
#   for_each = toset(var.queue_list)
#   name         = each.value
#   namespace_id = data.azurerm_servicebus_namespace.sb.id
# }
