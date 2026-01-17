
resource "aws_cloudfront_distribution" "primary" {
  aliases                         = ["*.${var.central_dns}"]
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
    Name = "${var.central_dns}Dist"
  }
  tags_all = {
    Name = "${var.central_dns}Dist"
  }
  wait_for_deployment = true
  web_acl_id          = null
  default_cache_behavior {
    allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cache_policy_id            = "83da9c7e-98b4-4e11-a168-04f0df8e2c65" # name: UseOriginCacheControlHeaders
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    default_ttl                = 0
    field_level_encryption_id  = null
    max_ttl                    = 0
    min_ttl                    = 0
    origin_request_policy_id   = "216adef6-5c7f-47e4-b989-5492eafa07d3" # name: AllViewer
    realtime_log_config_arn    = null
    response_headers_policy_id = null
    smooth_streaming           = false
    target_origin_id           = var.app_gateway_fqdn #-mjthjrlu2fy
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
    domain_name                 = var.app_gateway_fqdn
    origin_access_control_id    = null
    origin_id                   = var.app_gateway_fqdn #-mjthjrlu2fy
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
    acm_certificate_arn            = aws_acm_certificate.cert.arn
    cloudfront_default_certificate = false
    iam_certificate_id             = null
    minimum_protocol_version       = "TLSv1.3_2025"
    ssl_support_method             = "sni-only"
  }
}

# gets the Route53 hosted zone for the central domain
data "aws_route53_zone" "central" {
  name = var.central_dns
}

resource "aws_acm_certificate" "cert" {
  domain_name       = "*.${var.central_dns}"    
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# create Route53 records for ACM validation on the alreay existing hosted zone
resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.central.zone_id
}

resource "aws_acm_certificate_validation" "cert_validation" {
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

variable "central_dns" {
  type        = string
  description = "Parent domain name (from central.env CENTRAL_DNS)"
  validation {
    condition     = length(var.central_dns) > 0
    error_message = "central_dns must be provided."
  }
}

variable "app_gateway_fqdn" {
  type        = string
  default     = "root-zenblox-appgateway.australiaeast.cloudapp.azure.com"
  description = "Application Gateway FQDN to front with CloudFront"
}


