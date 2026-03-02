provider "aws" {
  # CloudFront is global; region here affects other resources only.
  region = "us-east-1"
}

#############################################
# Route53 Hosted Zone
#############################################
import {
  to = aws_route53_zone.primary
  # Hosted Zone ID (e.g., "Z1234567890ABC")
  id = "Z09935279NVTUB2GMFLL"
}

#############################################
# Route53 Records
#############################################
import {
  to = aws_route53_record.ns
  id = "Z09935279NVTUB2GMFLL_z3nm3.com.au._NS"
}

import {
  to = aws_route53_record.soa
  id = "Z09935279NVTUB2GMFLL_z3nm3.com.au._SOA"
}

import {
  to = aws_route53_record.validation_cname
  id = "Z09935279NVTUB2GMFLL__659ba89699ebcbed400d045d3e68355d.z3nm3.com.au._CNAME"
}