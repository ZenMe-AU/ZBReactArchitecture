output "principal_id" {
  value = azurerm_linux_function_app.fa.identity[0].principal_id
}
