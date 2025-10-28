output "app_registration_id" {
  value = var.shared_app_registration_client_id != "" ? var.shared_app_registration_client_id : module.cam.app_registration_id
}

output "app_registration_object_id" {
  value = var.shared_app_registration_object_id != "" ? var.shared_app_registration_object_id : module.cam.app_registration_object_id
}

output "available_feature_regions" {
  value = module.cam.available_feature_regions
}

output "cam_deployed_region" {
  value = var.cam_deployed_region
}

output "service_principal_object_id" {
  value = var.shared_service_principal_object_id != "" ? var.shared_service_principal_object_id : module.cam.service_principal_object_id
}

output "subscription_id" {
  value = module.cam.subscription_id
}

output "tenant_id" {
  value = module.cam.tenant_id
}
