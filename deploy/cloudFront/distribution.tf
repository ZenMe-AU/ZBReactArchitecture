# __generated__ by Terraform
# Please review these resources and move them into your main configuration files.

# __generated__ by Terraform from "83da9c7e-98b4-4e11-a168-04f0df8e2c65"
resource "aws_cloudfront_cache_policy" "default_cache" {
  comment     = "Policy for origins that return Cache-Control headers. Query strings are not included in the cache key."
  default_ttl = 0
  max_ttl     = 31536000
  min_ttl     = 0
  name        = "UseOriginCacheControlHeadersC"
  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    cookies_config {
      cookie_behavior = "all"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["host", "origin", "x-http-method", "x-http-method-override", "x-method-override"]
      }
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# __generated__ by Terraform from "a5d2616c-0ed0-498a-b4d6-c1dad76d3871"
resource "aws_cloudfront_origin_request_policy" "pass_all" {
  comment = "Includes Host header + all viewer headers for Azure Application Gateway routing"
  name    = "Pass-Host-And-All-HeadersC"
  cookies_config {
    cookie_behavior = "none"
  }
  headers_config {
    header_behavior = "allViewer"
  }
  query_strings_config {
    query_string_behavior = "none"
  }
}

# __generated__ by Terraform from "E17S1MSTK3D4WZ"
resource "aws_cloudfront_distribution" "primary" {
  aliases                         = ["*.z3nm3.com.au"]
  anycast_ip_list_id              = null
  comment                         = null
  continuous_deployment_policy_id = null
  default_root_object             = null
  enabled                         = true
  http_version                    = "http2and3"
  is_ipv6_enabled                 = true
  price_class                     = "PriceClass_100"
  retain_on_delete                = false
  staging                         = false
  tags = {
    Name = "zenbloxDist"
  }
  tags_all = {
    Name = "zenbloxDist"
  }
  wait_for_deployment = true
  web_acl_id          = null
  default_cache_behavior {
    allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cache_policy_id            = "83da9c7e-98b4-4e11-a168-04f0df8e2c65"
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    default_ttl                = 0
    field_level_encryption_id  = null
    max_ttl                    = 0
    min_ttl                    = 0
    origin_request_policy_id   = "a5d2616c-0ed0-498a-b4d6-c1dad76d3871"
    realtime_log_config_arn    = null
    response_headers_policy_id = null
    smooth_streaming           = false
    target_origin_id           = "root-zenblox-appgateway.australiaeast.cloudapp.azure.com-mjthjrlu2fy"
    trusted_key_groups         = []
    trusted_signers            = []
    viewer_protocol_policy     = "redirect-to-https"
    grpc_config {
      enabled = false
    }
  }
  origin {
    connection_attempts         = 3
    connection_timeout          = 10
    domain_name                 = "root-zenblox-appgateway.australiaeast.cloudapp.azure.com"
    origin_access_control_id    = null
    origin_id                   = "root-zenblox-appgateway.australiaeast.cloudapp.azure.com-mjthjrlu2fy"
    origin_path                 = null
    response_completion_timeout = 0
    custom_origin_config {
      http_port                = 80
      https_port               = 443
      ip_address_type          = "ipv4"
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "https-only"
      origin_read_timeout      = 30
      origin_ssl_protocols     = ["TLSv1.2"]
    }
  }
  restrictions {
    geo_restriction {
      locations        = []
      restriction_type = "none"
    }
  }
  viewer_certificate {
    acm_certificate_arn            = "arn:aws:acm:us-east-1:340593397057:certificate/5998df29-06f7-443c-8074-0f040baa72cc"
    cloudfront_default_certificate = false
    iam_certificate_id             = null
    minimum_protocol_version       = "TLSv1.3_2025"
    ssl_support_method             = "sni-only"
  }
}

#################################
resource "aws_acm_certificate" "cert" {
  domain_name       = "*.z3nm3.com.au"       # Use your distribution domain name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}
resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      value  = dvo.resource_record_value
    }
  }

  zone_id = "<HOSTED_ZONE_ID>"            # Replace with your Route53 Zone ID
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.value]
}

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

resource "aws_cloudfront_distribution" "primary" {
  # ... other config ...

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.cert.arn
    cloudfront_default_certificate = false
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.3_2025"
  }

  # ... rest of config ...
}

