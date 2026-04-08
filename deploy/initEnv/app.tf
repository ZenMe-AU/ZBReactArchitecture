#TODO: integrate 2 provider to the same subscription
provider "azurerm" {
  alias           = "z3nm3"
  features {}
  subscription_id = var.subscription_id
}

variable "provider_region" {
  description = "AWS region for the provider"
  type        = string
  default     = "us-east-1" # remove default to make it required
}

provider "aws" {
  region = var.provider_region
  profile = "default"
}

variable "corp_resource_group_name" {
  description = "Name of the Azure Resource Group for corporate resources group (dns zone)"
  type        = string
}
variable "login_app_name" {
  description = "Name of the Azure AD application for resource group application"
  type        = string
}
variable "dns_name" {
  description = "DNS name for the environment (e.g., zenme.com)"
  type        = string
}
variable "cf_rg_name" {
  description = "Name of the CloudFront distribution for resource group"
  type        = string
}
variable "cf_resource_group_origin_domain" {
  description = "The domain of resource group (apim) for the CloudFront distribution"
  type        = string
}
variable "origin_request_policy_name" {
  description = "The name of the CloudFront origin request policy to use"
  type        = string
}
variable "origin_response_headers_policy_name" {
  description = "The name of the CloudFront response headers policy to use for security headers"
  type        = string
}
variable "lambda_viewer_request_function_name" {
  description = "The name of the Lambda function to associate with CloudFront viewer request events (auth guard)"
  type        = string
}
variable "lambda_viewer_response_function_name" {
  description = "The name of the Lambda function to associate with CloudFront viewer response events (rewrite header)"
  type        = string
}
locals {
  app_domain = "${var.target_env}.${var.env_type}.${var.dns_name}"
  app_url    = "https://www.${local.app_domain}/"
}

#==========================================================
# Azure Application Registration for resource group application
#==========================================================
resource "random_uuid" "admin_role" {}
resource "random_uuid" "user_role" {}
resource "azuread_application" "rg" {
  display_name     = var.login_app_name
  sign_in_audience = "AzureADMyOrg"

  app_role {
    allowed_member_types = ["User"]
    description          = "App administrators"
    display_name         = "Admin"
    enabled              = true
    value                = "admin"
    id                   = random_uuid.admin_role.result
  }
  app_role {
    allowed_member_types = ["User"]
    description          = "Normal users"
    display_name         = "User"
    enabled              = true
    value                = "user"
    id                   = random_uuid.user_role.result
  }
 web {
    homepage_url = local.app_url
  }
  single_page_application {
    redirect_uris = [
      local.app_url,
      "${local.app_url}login",
    ]
  }
  required_resource_access {
    resource_app_id = "00000003-0000-0000-c000-000000000000" # Microsoft Graph

    resource_access {
      id   = "e1fe6dd8-ba31-4d61-89e7-88639da4683d" # User.Read
      type = "Scope"
    }
  }
}

#==========================================================
# AWS Certificate Manager for CloudFront with DNS validation
#==========================================================
resource "aws_acm_certificate" "cf" {
  domain_name       = local.app_domain
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${local.app_domain}"
  ]
   lifecycle {
    create_before_destroy = true
  }
}

resource "azurerm_dns_cname_record" "acm_validation" {
  provider = azurerm.z3nm3
  for_each = toset([ local.app_domain, "*.${local.app_domain}"])

  name  = one(distinct([
    for dvo in aws_acm_certificate.cf.domain_validation_options :
    replace(dvo.resource_record_name, ".${var.dns_name}.", "")
    if dvo.domain_name == each.key && dvo.resource_record_type == "CNAME"
  ]))

  record = one(distinct([
    for dvo in aws_acm_certificate.cf.domain_validation_options :
    dvo.resource_record_value
    if dvo.domain_name == each.key && dvo.resource_record_type == "CNAME"
  ]))

  zone_name           = var.dns_name
  resource_group_name = var.corp_resource_group_name
  ttl                 = 3600
}

# wait for certificate validation to complete
resource "aws_acm_certificate_validation" "cf" {
  certificate_arn = aws_acm_certificate.cf.arn
  validation_record_fqdns = [
    for r in azurerm_dns_cname_record.acm_validation :
    "${r.name}.${var.dns_name}"
  ]
}


#==========================================================x
# CloudFront Distribution for resource group
#==========================================================
# prepare CloudWatch Logs for CloudFront access logging
resource "aws_cloudwatch_log_group" "rg" {
  name              = "/aws/cloudfront/distribution/${var.cf_rg_name}"
  retention_in_days = 90
}

resource "aws_cloudwatch_log_delivery_source" "rg" {
  region       = "us-east-1"
  name         = var.cf_rg_name
  log_type     = "ACCESS_LOGS"
  resource_arn = aws_cloudfront_distribution.rg.arn
}

resource "aws_cloudwatch_log_delivery_destination" "rg" {
  region        = "us-east-1"
  name          = var.cf_rg_name
  output_format = "json"

  delivery_destination_configuration {
    destination_resource_arn = aws_cloudwatch_log_group.rg.arn
  }
}

resource "aws_cloudwatch_log_delivery" "rg" {
  region                   = "us-east-1"
  delivery_source_name     = aws_cloudwatch_log_delivery_source.rg.name
  delivery_destination_arn = aws_cloudwatch_log_delivery_destination.rg.arn
}

# get existing managed policies for CloudFront
data "aws_cloudfront_cache_policy" "rg" {
  name = "Managed-CachingDisabled"
}
data "aws_cloudfront_origin_request_policy" "rg" {
  name = var.origin_request_policy_name
}
data "aws_cloudfront_response_headers_policy" "rg" {
  name = var.origin_response_headers_policy_name
}
# get existing lambda@edge functions for CloudFront
data "aws_lambda_function" "viewer_request" {
  function_name = var.lambda_viewer_request_function_name
}
data "aws_lambda_function" "viewer_response" {
  function_name = var.lambda_viewer_response_function_name
}

resource "aws_cloudfront_distribution" "rg" {
  tags = {
    Name = var.cf_rg_name
  }

  depends_on = [
    aws_acm_certificate_validation.cf
  ]

  aliases = [
    local.app_domain,
    "*.${local.app_domain}"
  ]

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cf.arn
    ssl_support_method  = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  origin {
      domain_name = var.cf_resource_group_origin_domain
      origin_id = var.cf_resource_group_origin_domain
      custom_origin_config {
        http_port = 80
        https_port = 443
        origin_protocol_policy = "https-only"
        ip_address_type  = "dualstack"
        origin_ssl_protocols = ["TLSv1.2"]
      }
    }

    enabled             = true
    http_version        = "http2and3"
    default_cache_behavior {
    allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = var.cf_resource_group_origin_domain
    cache_policy_id  = data.aws_cloudfront_cache_policy.rg.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.rg.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.rg.id
    viewer_protocol_policy = "redirect-to-https"

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = data.aws_lambda_function.viewer_request.qualified_arn
      include_body = false
    }
    lambda_function_association {
      event_type   = "viewer-response"
      lambda_arn   = data.aws_lambda_function.viewer_response.qualified_arn
      include_body = false
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }
}


resource "azurerm_dns_cname_record" "rg_cloudfront" {
  provider = azurerm.z3nm3
  for_each = toset([
    replace(local.app_domain, ".${var.dns_name}", ""),
    replace("*.${local.app_domain}", ".${var.dns_name}", "")
  ])

  name                = each.key
  zone_name           = var.dns_name
  resource_group_name = var.corp_resource_group_name
  ttl                 = 3600

  record = aws_cloudfront_distribution.rg.domain_name
}
