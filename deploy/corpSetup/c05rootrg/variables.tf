
# Define variables for the environment deployment

# The target environment will automatically load from the environment variable TF_VAR_target_env
# variable "target_env" {
#   description = "The target environment for the module"
#   type        = string
# }
# output "target_env" {
#   value       = var.target_env
#   description = "value of target environment"
# }

variable "location" {
  description = "Azure location for resources, defaults to 'australiaeast' if not set"
  type        = string
  default     = "australiaeast"
}
# output "location" {
#   value       = var.location
#   description = "value of location"
# }

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "log_analytics_workspace_name" {
  description = "The name of the Log Analytics Workspace"
  type        = string
}

variable "subscription_id" {
  description = "The ID of the Azure Subscription"
  type        = string
}

variable "dns_name" {
  description = "The DNS name for the environment"
  type        = string
}