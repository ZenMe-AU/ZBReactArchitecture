# Create a storage account for ui
resource "azurerm_storage_account" "website" {
  name                     = var.storage_account_web_name
  resource_group_name      = data.azurerm_resource_group.main_resource.name
  location                 = data.azurerm_resource_group.main_resource.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Enable static website hosting on the storage account, this will automatically create a $web container
resource "azurerm_storage_account_static_website" "website" {
  storage_account_id = azurerm_storage_account.website.id
  index_document     = "index.html"
  error_404_document = "index.html"
}
