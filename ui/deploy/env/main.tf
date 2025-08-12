# Create a storage account for ui
resource "azurerm_storage_account" "website" {
  name                     = "${var.target_env}website"
  resource_group_name      = data.azurerm_resource_group.main_resource.name
  location                 = data.azurerm_resource_group.main_resource.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Create a storage container for static website content
resource "azurerm_storage_container" "static_content" {
  name                  = "$web"
  storage_account_id    = azurerm_storage_account.website.id
  container_access_type = "blob"
}

# Enable static website hosting on the storage account
resource "azurerm_storage_account_static_website" "example" {
  storage_account_id = azurerm_storage_account.website.id
  index_document     = "index.html"
  error_404_document = "index.html"
}
