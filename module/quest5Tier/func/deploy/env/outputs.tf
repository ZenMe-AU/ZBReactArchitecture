# Outputs for quest5tier Front Door configuration

output "quest5tier_frontdoor_endpoint_hostname" {
  description = "The hostname of the Front Door endpoint"
  value       = azurerm_cdn_frontdoor_endpoint.quest5tier_fd_endpoint.host_name
}

output "quest5tier_custom_domain_url" {
  description = "The custom domain URL for quest5tier API"
  value       = "https://${azurerm_cdn_frontdoor_custom_domain.quest5tier_custom_domain.host_name}"
}

output "quest5tier_function_app_hostname" {
  description = "The hostname of the underlying Function App"
  value       = data.azurerm_linux_function_app.quest5tier_func.default_hostname
}

output "quest5tier_frontdoor_profile_id" {
  description = "The ID of the Front Door profile"
  value       = azurerm_cdn_frontdoor_profile.quest5tier_fd_profile.id
}

output "quest5tier_frontdoor_identity_principal_id" {
  description = "The principal ID of the Front Door managed identity"
  value       = azurerm_cdn_frontdoor_profile.quest5tier_fd_profile.identity[0].principal_id
}