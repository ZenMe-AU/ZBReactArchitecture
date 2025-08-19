

# Create a storage container
resource "azurerm_storage_container" "fa" {
  name = lower("${var.target_env}-${var.module_name}-stor")
  storage_account_id    = data.azurerm_storage_account.main_sa.id
  container_access_type = "private"
}

resource "azurerm_function_app_flex_consumption" "fa2" {
  name                = "${var.target_env}-${var.module_name}-func"
  resource_group_name = data.azurerm_resource_group.main_rg.name
  location            = data.azurerm_resource_group.main_rg.location
  service_plan_id     = data.azurerm_service_plan.main_plan.id
 
  storage_container_type      = "blobContainer"
  storage_container_endpoint  = "${data.azurerm_storage_account.main_sa.primary_blob_endpoint}${azurerm_storage_container.fa.name}"
  storage_authentication_type = "SystemAssignedIdentity"
  runtime_name                = "node"
  runtime_version             = "20"
 
  site_config {
    application_insights_connection_string = data.azurerm_application_insights.main_appinsights.connection_string
    application_insights_key               = data.azurerm_application_insights.main_appinsights.instrumentation_key
  }
}

# Get the Azure AD group for storage contributors
data "azuread_group" "storage_contrib_group" {
  display_name     = "${var.target_env}-pvtstor-contributors"
  security_enabled = true
}
