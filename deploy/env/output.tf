output "env_name" {
  value = random_pet.env_name.id
}
output "subscription_id" {
  value = data.azurerm_client_config.current.subscription_id
}

output "rg_name" {
  value = azurerm_resource_group.rg.name
}

output "rg_location" {
  value = azurerm_resource_group.rg.location
}

output "sb_name" {
  value = azurerm_servicebus_namespace.sb_namespace.name
}

output "sa_name" {
  value = azurerm_storage_account.sa.name
}

output "plan_id" {
  value = azurerm_service_plan.plan.id
}

output "plan_os" {
  value = azurerm_service_plan.plan.os_type
}

output "pg_name" {
  value = azurerm_postgresql_flexible_server.pg_server.name
}

output "pg_id" {
  value = azurerm_postgresql_flexible_server.pg_server.id
}

output "group_name" {
  value = data.azuread_groups.group.display_names[0]
}
