provider "aws" {
  # CloudFront is global; region here affects other resources only.
  region = "us-east-1"
}

#############################################
# CloudFront Distribution
#############################################
import {
  to = aws_cloudfront_distribution.primary
  # Distribution ID from `list-distributions`: e.g., "E123ABC456XYZ"
  id = "E17S1MSTK3D4WZ"
}
 
#############################################
# Cache Policy (managed or custom)
#############################################
import {
  to = aws_cloudfront_cache_policy.default_cache
  # Policy ID GUID, e.g., "658327ea-f89d-4fab-a63d-7e88639e58f9"
  id = "83da9c7e-98b4-4e11-a168-04f0df8e2c65"
}
 
#############################################
# Origin Request Policy
#############################################
import {
  to = aws_cloudfront_origin_request_policy.pass_all
  # Policy ID GUID
  id = "a5d2616c-0ed0-498a-b4d6-c1dad76d3871"
}