# Create Function App
resource "azurerm_linux_function_app" "fa" {
  name                          = "${var.target_env}-${var.module_name}-func"
  location                      = data.azurerm_resource_group.main_rg.location
  resource_group_name           = data.azurerm_resource_group.main_rg.name
  service_plan_id               = data.azurerm_service_plan.main_plan.id
  storage_account_name          = data.azurerm_storage_account.main_sa.name
  storage_uses_managed_identity = true
  functions_extension_version   = "~4"

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME = "node"
  }

  site_config {
    application_stack {
      node_version = "22"
    }
    application_insights_connection_string = data.azurerm_application_insights.main_appinsights.connection_string
    application_insights_key               = data.azurerm_application_insights.main_appinsights.instrumentation_key
  }
}

# Get the Azure AD group for storage contributors
data "azuread_group" "storage_contrib_group" {
  display_name     = "${var.target_env}-pvtstor-contributors"
  security_enabled = true
}

# Assign Function App to Azure AD Group
resource "azuread_group_member" "func_identity_member" {
  group_object_id  = data.azuread_group.storage_contrib_group.object_id
  member_object_id = azurerm_linux_function_app.fa.identity[0].principal_id
}
