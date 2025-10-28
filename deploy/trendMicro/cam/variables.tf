variable "cam_deployed_region" {
  type        = string
  description = "The region where the CAM is deployed"
}

variable "cloud_account_name" {
  type        = string
  description = "The name of the cloud account"
}

variable "cloud_account_description" {
  type        = string
  description = "The description of the cloud account"
}

variable "connected_security_services_json" {
  type        = string
  description = "JSON-encoded string representing connected security services"
  default     = "[]"
}

variable "custom_role_name" {
  type        = string
  description = "The name of the custom role created"
}

variable "endpoint" {
  type        = string
  description = "The endpoint for the connected Azure Subscription"
}

variable "features" {
  type        = list(string)
  description = "The features"
}

variable "features_deployed_regions" {
  type        = map(list(string))
  description = "The regions where the features are enabled"
  default     = {}
}

variable "federated_credential_display_name" {
  type        = string
  default     = "v1-fed-cred"
  description = "The Vision One Federated Credential display name"
  validation {
    condition     = length(var.federated_credential_display_name) >= 4 && length(var.federated_credential_display_name) <= 32 && can(regex("^[0-9a-z-]+", var.federated_credential_display_name))
    error_message = "The federated-credential-display-name must be between 4 and 32 characters and must only contain the characters a-z, numbers 0-9 and hyphens."
  }
}

variable "issuer_url" {
  type        = string
  description = "The issuer URL for the connected Azure Subscription"
}

variable "subject_urn" {
  type        = string
  description = "The subject URN for the connected Azure Subscription"
}

variable "subscription_id" {
  type        = string
  description = "The connected Azure Subscription ID"
}

variable "template_version" {
  type        = string
  description = "The version"
}

variable "version_tag" {
  type        = string
  description = "The version tag"
  default     = "vision-one-deployment-version"
}

variable "v1_account_id" {
  type        = string
  description = "The Trend Micro Vision One Account ID"
}

variable "v1_api_key" {
  type        = string
  description = "The Trend Micro Vision One API key"
}

variable "v1_terraform_template_version" {
  type        = string
  description = "The Trend Micro Vision One Terraform template version"
}

variable "features_template_version" {
  type        = string
  description = "The Trend Micro Vision One features template version"
}

variable "app_registration_display_name" {
  type        = string
  description = "The display name of the app registration"
}


variable "shared_app_registration_client_id" {
  description = "ID of the shared app registration"
  type        = string
  default     = ""
}

variable "shared_app_registration_object_id" {
  description = "ID of the shared app registration object"
  type        = string
  default     = ""
}

variable "shared_service_principal_object_id" {
  description = "ID of the shared service principal"
  type        = string
  default     = ""
}

variable "feature_permissions" {
  description = "The permissions of Vision One Cloud Account Management features"
  type        = map(list(string))
  default     = {}
}

variable "is_user_account" {
  description = "Boolean value, true = user account and false = service principal"
  type        = bool
  default     = true
}
