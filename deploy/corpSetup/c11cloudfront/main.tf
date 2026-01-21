#==========================================================
# aws_acm_certificate
#         ↓
# azurerm_dns_cname_record (validation)
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

# resource "null_resource" "build_spa" {
#   provisioner "local-exec" {
#     command = "npm install && npm run build"
#     working_dir = var.bucket_spa_source_folder
#   }
# }

resource "aws_s3_object" "spa_files" {
  for_each = fileset("${var.bucket_spa_source_folder}/dist", "**/*")

  bucket = aws_s3_bucket.spa.id
  key    = each.value
  source = "${var.bucket_spa_source_folder}/dist/${each.value}"
  etag   = filemd5("${var.bucket_spa_source_folder}/dist/${each.value}")

  content_type = lookup(
    local.mime_types,
    lower(element(split(".", each.value), length(split(".", each.value)) - 1)),
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

# TODO: Enable CloudWatch Logs for Lambda@Edges
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
  
  excludes = ["lambda.zip"]
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

resource "aws_acm_certificate" "cf" {
  domain_name       = var.dns_name
  validation_method = "DNS"

  subject_alternative_names = [
    "*.${var.dns_name}"
  ]
   lifecycle {
    create_before_destroy = true
  }
}

resource "azurerm_dns_cname_record" "acm_validation" {
  for_each = toset([ var.dns_name, "*.${var.dns_name}"])

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
  resource_group_name = var.resource_group_name
  ttl                 = 3600
}

resource "aws_acm_certificate_validation" "cf" {
  certificate_arn = aws_acm_certificate.cf.arn

  validation_record_fqdns = [
    for r in azurerm_dns_cname_record.acm_validation :
    "${r.name}.${var.dns_name}"
  ]
}

resource "aws_cloudfront_origin_access_control" "oac_website" {
  name                              = var.cloudfront_oac_static_website_name
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_cache_policy" "static_website" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_distribution" "website" {
  depends_on = [
    aws_acm_certificate_validation.cf
  ]

  aliases = [
    "unavailable.${var.dns_name}"
  ]

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cf.arn
    ssl_support_method  = "sni-only"
  }

  origin {
    domain_name = aws_s3_bucket.static_website.bucket_regional_domain_name
    origin_id   = var.bucket_static_website_name
    origin_access_control_id = aws_cloudfront_origin_access_control.oac_website.id
  }

  default_root_object = "unavailable.html"
  enabled             = true
  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = var.bucket_static_website_name
    cache_policy_id  = data.aws_cloudfront_cache_policy.static_website.id

    viewer_protocol_policy = "redirect-to-https"

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.viewer_request.qualified_arn
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

resource "aws_s3_bucket_policy" "static_website" {
  bucket = aws_s3_bucket.static_website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontRead"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.static_website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })
}

resource "azurerm_dns_cname_record" "website_cloudfront" {
  name                = "unavailable"
  zone_name           = var.dns_name
  resource_group_name = var.resource_group_name
  ttl                 = 3600

  record = aws_cloudfront_distribution.website.domain_name
}

resource "aws_cloudfront_origin_access_control" "oac_spa" {
  name                              = var.cloudfront_oac_spa_name
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}


resource "aws_cloudfront_cache_policy" "html_no_cache" {
  name = "html-no-cache"

  default_ttl = 0
  min_ttl     = 0
  max_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_distribution" "spa" {
  depends_on = [
    aws_acm_certificate_validation.cf
  ]

  aliases = [
    "login.${var.dns_name}"
  ]

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.cf.arn
    ssl_support_method  = "sni-only"
  }

  origin {
    domain_name = aws_s3_bucket.spa.bucket_regional_domain_name
    origin_id   = var.bucket_spa_name
    origin_access_control_id = aws_cloudfront_origin_access_control.oac_spa.id
  }

  default_root_object = "index.html"
  enabled             = true
  ordered_cache_behavior {
    path_pattern    = "/assets/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = var.bucket_spa_name
    cache_policy_id  = data.aws_cloudfront_cache_policy.static_website.id

    viewer_protocol_policy = "redirect-to-https"
}
  default_cache_behavior {
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = var.bucket_spa_name
    cache_policy_id  = aws_cloudfront_cache_policy.html_no_cache.id

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }
}

resource "azurerm_dns_cname_record" "spa_cloudfront" {
  name                = "login"
  zone_name           = var.dns_name
  resource_group_name = var.resource_group_name
  ttl                 = 3600

  record = aws_cloudfront_distribution.spa.domain_name
}

resource "aws_s3_bucket_policy" "spa" {
  bucket = aws_s3_bucket.spa.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontRead"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.spa.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.spa.arn
          }
        }
      }
    ]
  })
}
