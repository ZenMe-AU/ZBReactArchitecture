# Initialize Terraform configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.1.0"

  backend "azurerm" {}
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# variable "parent_domain_name" {
#   description = "Parent domain name (e.g., zenblox.com.au)"
#   type        = string
#   default     = "zenblox.com.au"
# }
