# Create Role Assignments
resource "azurerm_role_assignment" "servicebus_sender" {
  scope                = var.servicebus_namespace_id
  role_definition_name = "Azure Service Bus Data Sender"
  principal_id         = var.function_app_principal_id
}

resource "azurerm_role_assignment" "servicebus_receiver" {
  scope                = var.servicebus_namespace_id
  role_definition_name = "Azure Service Bus Data Receiver"
  principal_id         = var.function_app_principal_id
}
