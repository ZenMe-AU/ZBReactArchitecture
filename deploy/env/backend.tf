terraform {
  backend "azurerm" {
    resource_group_name  = "zenmefunctionapp1"
    storage_account_name = "zenmefunctionapp1"
    container_name       = "tfstatefile"
    key                  = "dev/shared/terraform.tfstate"
  }
}
