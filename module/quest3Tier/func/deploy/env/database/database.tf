# Create a Module Database
resource "azurerm_postgresql_flexible_server_database" "module_db" {
  name      = var.database_name
  server_id = var.postgresql_server_id
  collation = "en_US.utf8"
  charset   = "UTF8"
}
