# Get the postgreSQL server details
data "azurerm_postgresql_flexible_server" "pg_server" {
  name                = "${var.target_env}-postgresqlserver"
  resource_group_name = data.azurerm_resource_group.main_rg.name
}

# Create a Module Database
resource "azurerm_postgresql_flexible_server_database" "module_db" {
  name      = var.module_name
  server_id = data.azurerm_postgresql_flexible_server.pg_server.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}
