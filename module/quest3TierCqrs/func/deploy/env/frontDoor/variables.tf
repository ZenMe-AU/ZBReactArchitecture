# Define variables for the environment deployment

variable "parent_domain_name" {
  description = "Parent domain name (e.g., zenblox.com.au)"
  type        = string
}

# The target environment will automatically load from the environment variable TF_VAR_target_env
variable "target_env" {
  description = "The target environment for the module"
  type        = string
}

# The module name will automatically load from the environment variable TF_VAR_module_name
variable "module_name" {
  description = "The name of the module"
  type        = string
}

variable "function_app_name" {
  description = "The name of the function app"
  type        = string
}

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "env_type" {
  type = string
}

variable "dns_resource_group_name" {
  description = "Resource group containing the public DNS zone"
  type        = string
}

variable "frontdoor_profile_name" {
  description = "Existing shared Front Door profile name (created upstream)"
  type        = string
}

variable "frontdoor_endpoint_name" {
  description = "Existing shared Front Door endpoint name"
  type        = string
}

variable "function_app_hostname" {
  description = "The hostname of the function app"
  type        = string
}
