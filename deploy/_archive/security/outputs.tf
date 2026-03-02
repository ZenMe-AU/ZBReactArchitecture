output "custom_frontdoor_url" {
  description = "The custom Front Door URL for the app."
  value       = "https://${azurerm_cdn_frontdoor_custom_domain.custom_domain.host_name}"
}
