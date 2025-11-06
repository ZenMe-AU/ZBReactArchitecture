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

variable "resource_group_name" {
  description = "Name of the Azure Resource Group"
  type        = string
}
output "resource_group_name" {
  value       = var.resource_group_name
  description = "value of resource group name"
}

variable "appconfig_name" {
  description = "Name of the Azure App Configuration"
  type        = string
}
output "appconfig_name" {
  value       = var.appconfig_name
  description = "value of app configuration name"
}

# Parent DNS settings to avoid hardcoding domain and RG names
variable "parent_domain_name" {
  description = "Parent domain name (e.g., zenblox.com.au) for custom domains"
  type        = string
}
output "parent_domain_name" {
  value       = var.parent_domain_name
  description = "value of parent domain name"
}

variable "dns_resource_group_name" {
  description = "Resource group name that will contain the DNS zone"
  type        = string
}
output "dns_resource_group_name" {
  value       = var.dns_resource_group_name
  description = "value of DNS resource group name"
}

# Control whether Terraform should manage DNS records. Useful if records already exist.
variable "manage_dns_txt_validation" {
  description = "Whether to create/manage the DNS TXT validation record (_dnsauth.<env>). Set to false to use an existing record."
  type        = bool
  default     = true
}
output "manage_dns_txt_validation" {
  value       = var.manage_dns_txt_validation
  description = "flag for managing DNS TXT validation record"
}

variable "manage_dns_cname" {
  description = "Whether to create/manage the DNS CNAME record (<env> -> Front Door). Set to false to use an existing record."
  type        = bool
  default     = true
}
output "manage_dns_cname" {
  value       = var.manage_dns_cname
  description = "flag for managing DNS CNAME record"
}

# Azure App Configuration
data "azurerm_app_configuration" "appconfig" {
  name                = var.appconfig_name
  resource_group_name = var.resource_group_name
  # depends_on = [  ]
}
