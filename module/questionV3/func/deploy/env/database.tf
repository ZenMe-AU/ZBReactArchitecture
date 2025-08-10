# Create a Module Database
resource "azurerm_postgresql_flexible_server_database" "module_db" {
  name      = var.module_name
  server_id = data.terraform_remote_state.shared.outputs.pg_id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

# Create role group for function app
resource "null_resource" "create_role_group" {
  provisioner "local-exec" {
    command = <<EOT
    export PGPASSWORD=$(az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv)
    psql "host=${data.terraform_remote_state.shared.outputs.pg_name}.postgres.database.azure.com port=5432 dbname=${azurerm_postgresql_flexible_server_database.module_db.name} user=${data.terraform_remote_state.shared.outputs.group_name} sslmode=require" \
    -c "CREATE ROLE \"${var.module_name}_rw_group\" NOLOGIN;" \
    -c "GRANT CONNECT ON DATABASE \"${azurerm_postgresql_flexible_server_database.module_db.name}\" TO \"${var.module_name}_rw_group\";" \
    -c "GRANT USAGE ON SCHEMA public TO \"${var.module_name}_rw_group\";" \
    -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"${var.module_name}_rw_group\";" \
    -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO \"${var.module_name}_rw_group\";" \
    -c "CREATE ROLE \"${var.module_name}_ro_group\" NOLOGIN;" \
    -c "GRANT CONNECT ON DATABASE \"${azurerm_postgresql_flexible_server_database.module_db.name}\" TO \"${var.module_name}_ro_group\";" \
    -c "GRANT USAGE ON SCHEMA public TO \"${var.module_name}_ro_group\";" \
    -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"${var.module_name}_ro_group\";" \
    -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO \"${var.module_name}_ro_group\";" \
    -c "SELECT * FROM pg_catalog.pgaadauth_create_principal_with_oid(E'${azurerm_linux_function_app.fa.name}'::text, E'${azurerm_linux_function_app.fa.identity[0].principal_id}'::text, 'service'::text, false, false);" \
    -c "GRANT \"${var.module_name}_rw_group\" TO \"${azurerm_linux_function_app.fa.name}\";"
    EOT
  }
}
# SELECT * FROM pg_catalog.pgaadauth_create_principal_with_oid('questionV3-fa', '8b2e6533-872b-4592-83a5-3ff2bc90266d', 'service', false, false);
# select * from pg_catalog.pgaadauth_list_principals(false);
