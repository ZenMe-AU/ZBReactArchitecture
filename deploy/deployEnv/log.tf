
# Application Insights
resource "azurerm_application_insights" "appinsights" {
  name                = var.app_insights_name
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.loganalytics_workspace.id
}

# # Diagnostic settings for Storage Account
# resource "azurerm_monitor_diagnostic_setting" "storage_diag" {
#   name                       = "${var.target_env}-storage-diagnostic"
#   target_resource_id         = data.azurerm_storage_account.sa.id
#   log_analytics_workspace_id = azurerm_log_analytics_workspace.loganalytics_workspace.id


#   enabled_log {
#     category = "AuditEvent"
#   }

#   #   enabled_metric {
#   #     category = "AllMetrics"
#   #   }
# }

# # Diagnostic settings for PostgreSQL Flexible Server
# resource "azurerm_monitor_diagnostic_setting" "postgresql_diag" {
#   name                       = "${var.target_env}-postgresqlserver-diagnostic"
#   target_resource_id         = azurerm_postgresql_flexible_server.pg_server.id
#   log_analytics_workspace_id = azurerm_log_analytics_workspace.loganalytics_workspace.id

#   enabled_log {
#     category = "PostgreSQLLogs"
#   }

#   #   enabled_metric {
#   #     category = "AllMetrics"
#   #   }
# }

# # Diagnostic settings for Service Bus Namespace
# resource "azurerm_monitor_diagnostic_setting" "servicebus_diag" {
#   name                       = "${var.target_env}-servicebus-diagnostic"
#   target_resource_id         = azurerm_servicebus_namespace.sb_namespace.id
#   log_analytics_workspace_id = azurerm_log_analytics_workspace.loganalytics_workspace.id

#   enabled_log {
#     category = "OperationalLogs"
#   }

#   #   enabled_metric {
#   #     category = "AllMetrics"
#   #   }
# }

# # Diagnostic settings for App Configuration
# resource "azurerm_monitor_diagnostic_setting" "appconfig_diag" {
#   name                       = "${var.target_env}-appconfig-diagnostic"
#   target_resource_id         = data.azurerm_app_configuration.appconfig.id
#   log_analytics_workspace_id = azurerm_log_analytics_workspace.loganalytics_workspace.id

#   enabled_log {
#     category = "PutKeyValue"
#   }

#   enabled_log {
#     category = "DeleteKeyValue"
#   }

#   #   enabled_metric {
#   #     category = "AllMetrics"
#   #   }
# }

