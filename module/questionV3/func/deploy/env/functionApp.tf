# Create Function App
resource "azurerm_linux_function_app" "fa" {
  name                        = "${var.module_name}-fa"
  location                    = data.terraform_remote_state.shared.outputs.rg_location
  resource_group_name         = data.terraform_remote_state.shared.outputs.rg_name
  service_plan_id             = data.terraform_remote_state.shared.outputs.plan_id
  storage_account_name        = data.terraform_remote_state.shared.outputs.sa_name
  storage_account_access_key  = data.azurerm_storage_account.main_sa.primary_access_key
  functions_extension_version = "~4"

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    FUNCTIONS_WORKER_RUNTIME            = "node"
    SERVICEBUS__fullyQualifiedNamespace = "${data.azurerm_servicebus_namespace.sb.name}.servicebus.windows.net"
    NODE_ENV                            = var.module_env
  }

  site_config {
    application_stack {
      node_version = "22"
    }
  }
}

