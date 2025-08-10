terraform {
  backend "azurerm" {
    resource_group_name  = data.azurerm_storage_account.main_sa.resource_group_name
    storage_account_name = data.azurerm_storage_account.main_sa.name
    container_name       = "tfstatefile"
    key                  = "${var.target_env}-${var.module_name}-terraform.tfstate"
  }
}

