output "app_registration_id" {
  value = var.shared_app_registration_client_id != "" ? var.shared_app_registration_client_id : azuread_application.app-registration[0].client_id
}

output "app_registration_object_id" {
  value = var.shared_app_registration_object_id != "" ? var.shared_app_registration_object_id : azuread_application.app-registration[0].object_id
}

output "available_feature_regions" {
  value = local.available_feature_regions
}

output "service_principal_object_id" {
  value = var.shared_service_principal_object_id != "" ? var.shared_service_principal_object_id : azuread_service_principal.service-principal[0].object_id
}

output "subscription_id" {
  value = local.subscription_id
}

output "tenant_id" {
  value = data.azurerm_client_config.current.tenant_id
}

output "cam_deployed_region" {
  value = var.cam_deployed_region
}

output "v1_account_id" {
  value = var.v1_account_id
}
