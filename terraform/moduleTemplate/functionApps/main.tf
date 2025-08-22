# Create a App Service Plan (1v1)
resource "azurerm_service_plan" "plan" {
  name                = var.service_plan_name
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = "FC1" # Flex Consumption Plan
}

# Create a storage container
resource "azurerm_storage_container" "fa" {
  name                  = var.storage_container_name
  storage_account_id    = var.storage_account_id
  container_access_type = "private"
}

# Create Function App
resource "azurerm_function_app_flex_consumption" "fa" {
  name                = var.function_app_name
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location
  service_plan_id     = azurerm_service_plan.plan.id

  storage_container_type      = "blobContainer"
  storage_container_endpoint  = "https://${var.storage_account_name}.blob.core.windows.net/${var.storage_container_name}"
  storage_authentication_type = "SystemAssignedIdentity"
  runtime_name                = "node"
  runtime_version             = "22"
  identity {
    type = "SystemAssigned"
  }


  app_settings = {
    AzureWebJobsStorage__accountName     = var.storage_account_name
    AzureWebJobsStorage__credential      = "managedidentity"
    AzureWebJobsStorage__queueServiceUri = "https://${var.storage_account_name}.queue.core.windows.net/"
    AzureWebJobsStorage__tableServiceUri = "https://${var.storage_account_name}.table.core.windows.net/"
    AzureWebJobsStorage__blobServiceUri  = "https://${var.storage_account_name}.blob.core.windows.net/"
  }

  site_config {
    application_insights_connection_string = var.application_insights_connection_string
    application_insights_key               = var.application_insights_key
  }
}


# the function app does not use storage account directly,so we do not need to assign permissions to the storage account
# Assign Function App to Azure AD Group
# resource "azuread_group_member" "func_identity_member" {
#   group_object_id  = var.storage_contrib_group_object_id
#   member_object_id = azurerm_linux_function_app.fa.identity[0].principal_id
# }

# resource "azurerm_role_assignment" "fa_to_appinsights" {
#   scope                = var.application_insights_id
#   role_definition_name = "Monitoring Metrics Publisher"
#   principal_id         = azurerm_linux_function_app.fa.identity[0].principal_id
# }
