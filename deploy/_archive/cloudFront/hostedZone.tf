resource "aws_route53_zone" "primary" {
  name = "z3nm3.com.au"
}

## Commented out NS and SOA records: AWS creates these automatically for public hosted zones.
## If you need Terraform to manage existing NS/SOA records, import the zone into state instead.
# resource "aws_route53_record" "ns" {
#   zone_id = aws_route53_zone.primary.zone_id
#   name    = "z3nm3.com.au"
#   type    = "NS"
#   ttl     = 172800
#   records = [
#     "ns-1418.awsdns-49.org.",
#     "ns-1879.awsdns-42.co.uk.",
#     "ns-84.awsdns-10.com.",
#     "ns-930.awsdns-52.net.",
#   ]
# }
#
# resource "aws_route53_record" "soa" {
#   zone_id = aws_route53_zone.primary.zone_id
#   name    = "z3nm3.com.au"
#   type    = "SOA"
#   ttl     = 900
#   records = [
#     "ns-1418.awsdns-49.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400",
#   ]
# }

# resource "aws_route53_record" "validation_cname" {
#   zone_id = aws_route53_zone.primary.zone_id
#   name    = "_659ba89699ebcbed400d045d3e68355d.z3nm3.com.au"
#   type    = "CNAME"
#   ttl     = 300
#   records = [
#     "_b9f55ceede849e2ac1b62521830d0e94.jkddzztszm.acm-validations.aws.",
#   ]
# }

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      value  = dvo.resource_record_value
    }
  }

  zone_id = aws_route53_zone.primary.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 300
  records = [each.value.value]
}
