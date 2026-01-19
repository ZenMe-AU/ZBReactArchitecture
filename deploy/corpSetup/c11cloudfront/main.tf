terraform {
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.provider_region
}

# provider "azurerm" {
#   features {}
#   subscription_id = var.subscription_id
# }

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
  description = "The name of the S3 bucket for static website hosting"
  type        = string
  default     = "asleepswordtail-static-website"
}

variable "bucket_spa_name" {
  description = "The name of the S3 bucket for the SPA"
  type        = string
  default     = "asleepswordtail-spa"
}

variable "bucket_static_website_source_folder" {
  description = "The source folder for the static website files"
  type        = string
  default     = "source/webpage"
}

variable "bucket_spa_source_folder" {
  description = "The source folder for the SPA files"
  type        = string
  default     = "source/msalSpa/dist"
}

variable "lambda_edge_auth_guard_role" {
  description = "The IAM role for the Lambda@Edge auth guard function"
  type        = string
  default     = "asleepswordtail-authGuard-func-role"
}

variable "lambda_edge_auth_guard_source_folder" {
  description = "The source folder for the Lambda@Edge auth guard function"
  type        = string
  default     = "source/authGuardLambdaEdge"
}

variable "lambda_edge_auth_guard_name" {
  description = "The name of the Lambda@Edge auth guard function"
  type        = string
  default     = "asleepswordtail-authGuard-func"
}

#==========================================================
# aws_acm_certificate
#         ↓
# azurerm_dns_txt_record
#         ↓
# aws_acm_certificate_validation
#         ↓
# aws_cloudfront_distribution
#         ↓
# azurerm_dns_cname_record (point CloudFront)
#==========================================================

resource "aws_s3_bucket" "static_website" {
  bucket = var.bucket_static_website_name
}

resource "aws_s3_bucket" "spa" {
  bucket = var.bucket_spa_name
}

resource "aws_s3_object" "unavailable_page" {
  bucket       = aws_s3_bucket.static_website.id
  key          = "unavailable.html"
  source       = "${var.bucket_static_website_source_folder}/unavailable.html"
  content_type = "text/html"
}

resource "aws_s3_object" "spa_files" {
  for_each = fileset(var.bucket_spa_source_folder, "**/*")

  bucket = aws_s3_bucket.spa.id
  key    = each.value
  source = "${var.bucket_spa_source_folder}/${each.value}"

  content_type = lookup(
    local.mime_types,
    lower(regex("\\.([^.]+)$", each.value)[0]),
    "binary/octet-stream"
  )
}

data "aws_iam_policy_document" "lambda_edge_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = [
        "lambda.amazonaws.com",
        "edgelambda.amazonaws.com"
      ]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_edge_auth_guard" {
  name = var.lambda_edge_auth_guard_role
  assume_role_policy = data.aws_iam_policy_document.lambda_edge_assume_role.json
}

resource "aws_iam_role_policy_attachment" "lambda_edge_auth_guard_policy" {
  role       = aws_iam_role.lambda_edge_auth_guard.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# resource "aws_cloudwatch_log_group" "lambda_edge_auth_guard_logs" {
#   name              = "/aws/lambda/${var.lambda_edge_auth_guard_name}"
#   retention_in_days = 14

#   # tags = {
#   #   Environment = "production"
#   #   Application = var.lambda_edge_auth_guard_name
#   # }
# }

data "archive_file" "edge_zip" {
  type        = "zip"
  source_dir  = var.lambda_edge_auth_guard_source_folder
  output_path = "${var.lambda_edge_auth_guard_source_folder}/lambda.zip"
}

resource "aws_lambda_function" "viewer_request" {
  function_name = var.lambda_edge_auth_guard_name
  role          = aws_iam_role.lambda_edge_auth_guard.arn
  handler       = "index.handler"
  runtime       = "nodejs22.x"

  filename = data.archive_file.edge_zip.output_path
  source_code_hash = data.archive_file.edge_zip.output_base64sha256
  publish = true

  depends_on = [
    aws_iam_role_policy_attachment.lambda_edge_auth_guard_policy,
    # aws_cloudwatch_log_group.lambda_edge_auth_guard_logs
  ]
}

# variable "dns_name" {
#   description = "The DNS name for the environment"
#   type        = string
# }

# variable "resource_group_name" {
#   description = "The name of the resource group"
#   type        = string
# }

# variable "subscription_id" {
#   description = "The ID of the Azure Subscription"
#   type        = string
# }

# resource "aws_acm_certificate" "cf" {
#   domain_name       = var.dns_name
#   validation_method = "DNS"

#   subject_alternative_names = [
#     "*.${var.dns_name}"
#   ]
# }

# resource "azurerm_dns_txt_record" "acm_validation" {
#   for_each = {
#     for dvo in aws_acm_certificate.cf.domain_validation_options :
#     dvo.domain_name => {
#       name  = replace(dvo.resource_record_name, ".${var.dns_name}.", "")
#       value = dvo.resource_record_value
#     }
#   }

#   name                = each.value.name
#   zone_name           = var.dns_name
#   resource_group_name = var.resource_group_name
#   ttl                 = 3600

#   record {
#     value = each.value.value
#   }
# }
# resource "aws_acm_certificate_validation" "cf" {
#   certificate_arn = aws_acm_certificate.cf.arn

#   validation_record_fqdns = [
#     for r in azurerm_dns_txt_record.acm_validation :
#     "${r.name}.${var.dns_name}"
#   ]
# }

# resource "aws_cloudfront_origin_access_control" "oac" {
#   name                              = "site-oac"
#   origin_access_control_origin_type = "s3"
#   signing_behavior                  = "always"
#   signing_protocol                  = "sigv4"
# }

# resource "aws_cloudfront_distribution" "site" {
#   depends_on = [
#     aws_acm_certificate_validation.cf
#   ]

# aliases = [
#     "www.example.com"
#   ]

#  default_root_object = "index.html"

#   viewer_certificate {
#     acm_certificate_arn = aws_acm_certificate.cf.arn
#     ssl_support_method  = "sni-only"
#   }

#   origin {
#     domain_name = aws_s3_bucket.site.bucket_regional_domain_name
#     origin_id   = "s3-origin"

  # origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
#     s3_origin_config {
#       origin_access_identity = ""
#     }
# }

# resource "azurerm_dns_cname_record" "cloudfront" {
#   name                = "www"
#   zone_name           = "example.com"
#   resource_group_name = "dns-rg"
#   ttl                 = 300

#   record = aws_cloudfront_distribution.site.domain_name
# }



# resource "aws_iam_role" "lambda_edge" {
#   name = "lambda-edge-role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Principal = {
#           Service = [
#             "lambda.amazonaws.com",
#             "edgelambda.amazonaws.com"
#           ]
#         }
#         Action = "sts:AssumeRole"
#       }
#     ]
#   })
# }
# resource "aws_iam_role_policy_attachment" "lambda_logs" {
#   role       = aws_iam_role.lambda_edge.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
# }







# resource "aws_s3_bucket" "site" {
#   bucket = "my-tf-test-bucket-asleepswordtail"
# }
# #unavailable+login
# resource "aws_cloudfront_distribution" "s3_distribution" {
#   origin {
#       domain_name = "${aws_s3_bucket.site.bucket_regional_domain_name}"
#       origin_id   = "my_first_origin"
#   }

#   enabled             = true
#   default_cache_behavior {
#     allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
#     cached_methods   = ["GET", "HEAD"]
#     target_origin_id = "my_first_origin"

#     forwarded_values {
#       query_string = false

#       cookies {
#         forward = "none"
#       }
#     }

#     viewer_protocol_policy = "allow-all"
#     # min_ttl                = 0
#     # default_ttl            = 3600
#     # max_ttl                = 86400
#   }

#   restrictions {
#     geo_restriction {
#       restriction_type = "none"
#       locations        = []
#     }
#   }

#   viewer_certificate {
#     cloudfront_default_certificate = true
#   }
# }
