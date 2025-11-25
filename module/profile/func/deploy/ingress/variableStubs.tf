## Stub variables for local authoring convenience only.
## NOTE: build.ps1 does NOT copy this file into deploy/ingress/dist.
## The real declarations (and values) come from env slice in ingress.tf.
## Leaving these here silences editor/LSP 'undeclared variable' warnings
## when working in the module folder standalone.

variable "central_env" {
  type        = string
  description = "(Stub) Central resource group hosting the shared Front Door profile. Provided by env slice during build." 
  default     = ""
}

variable "frontdoor_profile_name" {
  type        = string
  description = "(Stub) Shared Front Door profile name. Actual declaration exists in env ingress.tf."
  default     = "FrontDoor"
}

variable "enable_web_origin" {
  type        = bool
  description = "(Stub) Whether env slice enables a web origin. Real variable declared in env ingress.tf."
  default     = false
}

variable "web_origin_host_override" {
  type        = string
  description = "(Stub) Host name for static web origin. Real variable declared in env ingress.tf."
  default     = ""
}
