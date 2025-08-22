# Create Function App
resource "azurerm_linux_function_app" "fa" {
  name                          = var.function_app_name
  location                      = var.resource_group_location
  resource_group_name           = var.resource_group_name
  service_plan_id               = var.service_plan_id
  storage_account_name          = var.storage_account_name
  storage_uses_managed_identity = true
  functions_extension_version   = "~4"

  identity {
    type = "SystemAssigned"
  }

  #   app_settings = {
  #     FUNCTIONS_WORKER_RUNTIME = "node"
  #   }

  site_config {
    application_stack {
      node_version = "22"
    }
    application_insights_connection_string = var.application_insights_connection_string
    application_insights_key               = var.application_insights_key
  }
}

# # the function app does not use storage account directly,so we do not need to assign permissions to the storage account
# # Assign Function App to Azure AD Group
# resource "azuread_group_member" "func_identity_member" {
#   group_object_id  = var.storage_contrib_group_object_id
#   member_object_id = azurerm_linux_function_app.fa.identity[0].principal_id
# }

# resource "azurerm_role_assignment" "fa_to_appinsights" {
#   scope                = var.application_insights_id
#   role_definition_name = "Monitoring Metrics Publisher"
#   principal_id         = azurerm_linux_function_app.fa.identity[0].principal_id
# }
