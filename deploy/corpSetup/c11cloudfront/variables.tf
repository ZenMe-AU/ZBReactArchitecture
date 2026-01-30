
# Define variables for the environment deployment

locals {
  mime_types = {
    html  = "text/html"
    css   = "text/css"
    js    = "application/javascript"
    json  = "application/json"
    svg   = "image/svg+xml"
    png   = "image/png"
    jpg   = "image/jpeg"
    jpeg  = "image/jpeg"
    webp  = "image/webp"
    ico   = "image/x-icon"
    woff  = "font/woff"
    woff2 = "font/woff2"
    ttf   = "font/ttf"
    map   = "application/json"
  }
}

variable "provider_region" {
  description = "The AWS region for the provider"
  type        = string
  default     = "us-east-1"
}

variable "bucket_static_website_name" {
  description = "The name of the AWS S3 bucket for static website hosting"
  type        = string
  # default     = "asleepswordtail-static-website"
}

variable "bucket_spa_name" {
  description = "The name of the AWS S3 bucket for the SPA"
  type        = string
  # default     = "asleepswordtail-spa"
}

variable "bucket_static_website_source_folder" {
  description = "The source folder for the static website files"
  type        = string
  # default     = "source/webpage"
}

variable "bucket_spa_source_folder" {
  description = "The source folder for the SPA files"
  type        = string
  # default     = "source/msalSpa"
}

variable "lambda_edge_auth_guard_role" {
  description = "The IAM role for the AWS Lambda@Edge auth guard function"
  type        = string
  # default     = "asleepswordtail-authGuard-func-role"
}

variable "lambda_edge_auth_guard_source_folder" {
  description = "The source folder for the AWS Lambda@Edge auth guard function"
  type        = string
  # default     = "source/authGuardLambdaEdge"
}

variable "lambda_edge_auth_guard_name" {
  description = "The name of the AWS Lambda@Edge auth guard function"
  type        = string
  # default     = "asleepswordtail-authGuard-func"
}

variable "dns_name" {
  description = "The DNS name for the corporate website"
  type        = string
  # default = "z3nm3.com"
  default = "zenblox.com.au"
}

variable "resource_group_name" {
  description = "The name of the Azure resource group"
  type        = string
  default = "root-zenblox"
}

variable "subscription_id" {
  description = "The ID of the Azure Subscription"
  type        = string
  # default     = "0930d9a7-2369-4a2d-a0b6-5805ef505868"
}

variable "cloudfront_oac_static_website_name" {
  description = "The name of the AWS CloudFront origin access control for the static website"
  type        = string
  # default     = "asleepswordtail-static-website-oac"
}

variable "cloudfront_oac_spa_name" {
  description = "The name of the AWS CloudFront origin access control for the SPA"
  type        = string
  # default     = "asleepswordtail-spa--oac"
}

variable "app_registration_name" {
  description = "The name of the azure app registration"
  type        = string
  # default     = "zenblox-login"
}
# need Application Administrator role to manage app registration

variable "origin_request_policy_name" {
  description = "The name of the origin request policy for APIM"
  type        = string
  # default     = "asleepswordtail-origin-request-policy"
}