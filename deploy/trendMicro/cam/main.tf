data "azurerm_client_config" "current" {
}

data "azuread_user" "current" {
  count     = var.is_user_account ? 1 : 0
  object_id = data.azurerm_client_config.current.object_id
}

data "azuread_service_principal" "current" {
  count     = var.is_user_account ? 0 : 1
  object_id = data.azurerm_client_config.current.object_id
}

provider "azurerm" {
  features {}
  subscription_id                 = var.subscription_id
  resource_provider_registrations = "none"
}

locals {
  app_registration_display_name      = var.app_registration_display_name
  cam_deployed_region                = var.cam_deployed_region
  cloud_account_name                 = var.cloud_account_name
  cloud_account_description          = var.cloud_account_description
  connected_security_services_json   = var.connected_security_services_json
  custom_role_name                   = var.custom_role_name
  endpoint                           = var.endpoint
  features                           = var.features
  features_deployed_regions          = var.features_deployed_regions
  issuer_url                         = var.issuer_url
  subscription_id                    = var.subscription_id
  subject_urn                        = var.subject_urn
  template_version                   = var.template_version
  version_tag                        = var.version_tag
  v1_account_id                      = var.v1_account_id
  v1_api_key                         = var.v1_api_key
  v1_terraform_template_version      = var.v1_terraform_template_version
  features_template_version          = var.features_template_version
  available_feature_regions          = local.features_deployed_regions
  shared_app_registration_client_id  = var.shared_app_registration_client_id
  shared_app_registration_object_id  = var.shared_app_registration_object_id
  shared_service_principal_object_id = var.shared_service_principal_object_id
  feature_permissions                = var.feature_permissions
  barebone_permissions = {
    #start of role replace
		actions = ["Microsoft.ContainerService/managedClusters/listClusterUserCredential/action","Microsoft.ContainerService/managedClusters/read","Microsoft.Resources/subscriptions/resourceGroups/read","Microsoft.Authorization/roleAssignments/read","Microsoft.Authorization/roleDefinitions/read","*/read","Microsoft.AppConfiguration/configurationStores/ListKeyValue/action","Microsoft.Network/networkWatchers/queryFlowLogStatus/action","Microsoft.Web/sites/config/list/Action","Microsoft.Web/sites/functions/listkeys/action","Microsoft.KeyVault/vaults/secrets/read","Microsoft.Web/sites/config/read","Microsoft.Resources/deployments/read","Microsoft.Resources/deployments/operations/read","Microsoft.Resources/deployments/operationstatuses/read"]
		data_actions = ["Microsoft.KeyVault/vaults/keys/read","Microsoft.KeyVault/vaults/secrets/readMetadata/action","Microsoft.KeyVault/vaults/secrets/getSecret/action"]
#end of role replace
  }
}
