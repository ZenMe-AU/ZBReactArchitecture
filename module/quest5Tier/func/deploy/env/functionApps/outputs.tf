output "function_app_principal_id" {
  value = azurerm_function_app_flex_consumption.fa.identity[0].principal_id
}

output "default_hostname" {
  value = azurerm_function_app_flex_consumption.fa.default_hostname
}

