terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.0"
    }
  }
  required_version = ">= 1.1.0"
}
provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

provider "azuread" {}

variable "target_env" {
  description = "Target environment name for deployment, this must be globally unique on Azure"
  type        = string
}
output "target_env" {
  value       = var.target_env
  description = "value of target environment"
}

variable "env_type" {
  description = "Environment type for deployment, like dev, test, prod"
  type        = string
  validation {
    condition     = contains(["dev", "test", "prod"], var.env_type)
    error_message = "env_type must be one of: dev, test, prod."
  }
}
output "env_type" {
  value       = var.env_type
  description = "value of environment type"
}

variable "subscription_id" {
  description = "Subscription ID for Azure resources"
  type        = string
}
output "subscription_id" {
  value       = var.subscription_id
  description = "value of subscription ID"
}

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
}
output "resource_group_name" {
  value       = var.resource_group_name
  description = "value of resource group name"
}

variable "storage_account_name" {
  description = "Name of the Azure Storage Account"
  type        = string
}
output "storage_account_name" {
  value       = var.storage_account_name
  description = "value of storage account name"
}

variable "appconfig_name" {
  description = "Name of the Azure App Configuration"
  type        = string
}
output "appconfig_name" {
  value       = var.appconfig_name
  description = "value of app configuration name"
}

# # Parent DNS settings to avoid hardcoding domain and RG names
# variable "parent_domain_name" {
#   description = "Parent domain name (e.g., zenblox.com.au) for custom domains"
#   type        = string
# }
# output "parent_domain_name" {
#   value       = var.parent_domain_name
#   description = "value of parent domain name"
# }

# variable "dns_resource_group_name" {
#   description = "Resource group name that will contain the DNS zone"
#   type        = string
# }
# output "dns_resource_group_name" {
#   value       = var.dns_resource_group_name
#   description = "value of DNS resource group name"
# }

# # Control whether Terraform should manage DNS records. Useful if records already exist.
# variable "manage_dns_txt_validation" {
#   description = "Whether to create/manage the DNS TXT validation record (_dnsauth.<env>). Set to false to use an existing record."
#   type        = bool
#   default     = true
# }
# output "manage_dns_txt_validation" {
#   value       = var.manage_dns_txt_validation
#   description = "flag for managing DNS TXT validation record"
# }

# variable "manage_dns_cname" {
#   description = "Whether to create/manage the DNS CNAME record (<env> -> Front Door). Set to false to use an existing record."
#   type        = bool
#   default     = true
# }
# output "manage_dns_cname" {
#   value       = var.manage_dns_cname
#   description = "flag for managing DNS CNAME record"
# }

data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

# create a storage account for this environment
data "azurerm_storage_account" "sa" {
  name                = var.storage_account_name
  resource_group_name = data.azurerm_resource_group.rg.name
}
# Azure App Configuration
data "azurerm_app_configuration" "appconfig" {
  name                = var.appconfig_name
  resource_group_name = data.azurerm_resource_group.rg.name
  # depends_on = [  ]
}

# Get the Azure client configuration for tenant ID
data "azurerm_client_config" "current" {}
output "tenant_id" {
  value = data.azurerm_client_config.current.tenant_id
}


# # TODO:azurerm_pim_active_role_assignment
# resource "azurerm_pim_active_role_assignment" "pim_active_role_assignment" {
#   scope              = data.azurerm_subscription.primary.id
#   role_definition_id = "${data.azurerm_subscription.primary.id}${data.azurerm_role_definition.example.id}"
#   principal_id       = data.azurerm_client_config.example.object_id
# }
variable "log_analytics_workspace_name" {
  description = "Name of the Azure Log Analytics Workspace"
  type        = string

}
output "log_analytics_workspace_name" {
  value       = var.log_analytics_workspace_name
  description = "value of log analytics workspace name"
}
variable "service_bus_name" {
  description = "Name of the Azure Service Bus Namespace"
  type        = string

}
output "service_bus_name" {
  value       = var.service_bus_name
  description = "value of service bus namespace name"
}
variable "postgresql_server_name" {
  description = "Name of the Azure PostgreSQL Flexible Server"
  type        = string

}
output "postgresql_server_name" {
  value       = var.postgresql_server_name
  description = "value of postgresql server name"
}
variable "db_admin_group_name" {
  description = "Name of the Azure PostgreSQL Flexible Server Admin"
  type        = string
}
output "db_admin_group_name" {
  value       = var.db_admin_group_name
  description = "value of db admin name"
}
variable "identity_name" {
  description = "Name of the Azure User Assigned Identity"
  type        = string
}
output "identity_name" {
  value       = var.identity_name
  description = "value of identity name"
}
variable "app_insights_name" {
  description = "Name of the Azure Application Insights"
  type        = string
}
output "app_insights_name" {
  value       = var.app_insights_name
  description = "value of app insights name"
}

variable "deployer_app_name" {
  description = "Name of the Azure Deployer Application"
  type        = string
  default     = null
}
output "deployer_app_name" {
  value       = var.deployer_app_name
  description = "value of deployer application name"
}
locals {
  has_deployer = var.deployer_app_name != null
}