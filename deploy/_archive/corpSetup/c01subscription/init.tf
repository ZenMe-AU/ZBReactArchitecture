terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

data "azurerm_billing_mca_account_scope" "azure_billing" {
  billing_account_name = var.billing_account_name
  billing_profile_name = var.billing_profile_name
  invoice_section_name = var.invoice_section_name
}

# output "billing_profile_name" {
#   value       = data.azurerm_billing_mca_account_scope.azurebilling.billing_profile_name
#   description = "value of billing profile name"
# }
# output "billing_profile_id" {
#   value       = data.azurerm_billing_mca_account_scope.azurebilling.id
#   description = "value of billing profile id"
# }

