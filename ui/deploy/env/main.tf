# Create a storage account for ui
resource "azurerm_storage_account" "website" {
  name                     = var.storage_account_web_name
  resource_group_name      = data.azurerm_resource_group.main_resource.name
  location                 = data.azurerm_resource_group.main_resource.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Reference existing storage container for static web content
data "azurerm_storage_container" "static_content" {
  name                 = "$web"
  storage_account_name = azurerm_storage_account.website.name
}

# Enable static website hosting on the storage account
resource "azurerm_storage_account_static_website" "website" {
  storage_account_id = azurerm_storage_account.website.id
  index_document     = "index.html"
  error_404_document = "index.html"
}

data "azurerm_app_configuration" "config" {
  name                = var.appconfig_name
  resource_group_name = data.azurerm_resource_group.main_resource.name
}

# webEndpoint for the static website
resource "azurerm_app_configuration_key" "endpoint" {
  configuration_store_id = data.azurerm_app_configuration.config.id
  key                    = "webEndpoint"
  value                  = azurerm_storage_account.website.primary_web_endpoint
  label                  = var.env_type
}

# Assign Storage Blob Data Contributor role to the LeadDeveloper
data "azuread_group" "lead_developer" {
  display_name = "LeadDeveloper" // TODO: check - should i use ResourceGroupDeployer
}
resource "azurerm_role_assignment" "blob_contributor" {
  principal_id         = data.azuread_group.lead_developer.id
  role_definition_name = "Storage Blob Data Contributor"
  scope                = azurerm_storage_account.website.id
}
