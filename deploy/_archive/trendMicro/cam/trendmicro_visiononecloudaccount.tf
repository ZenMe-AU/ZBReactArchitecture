resource "azuread_application" "app-registration" {
  count        = var.shared_app_registration_client_id != "" ? 0 : 1
  display_name = local.app_registration_display_name
  owners       = var.is_user_account ? [data.azuread_user.current[0].object_id]: [data.azuread_service_principal.current[0].object_id]
  #start of replace
	required_resource_access {
		resource_app_id = "00000002-0000-0000-c000-000000000000"
		resource_access {
			id = "311a71cc-e848-46a1-bdf8-97ff7156d8e6"
			type = "Scope"
		}
	}
	required_resource_access {
		resource_app_id = "00000003-0000-0000-c000-000000000000"
		resource_access {
			id = "e1fe6dd8-ba31-4d61-89e7-88639da4683d"
			type = "Scope"
		}
		resource_access {
			id = "a154be20-db9c-4678-8ab7-66f6cc099a59"
			type = "Scope"
		}
		resource_access {
			id = "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
			type = "Role"
		}
		resource_access {
			id = "df021288-bdef-4463-88db-98f22de89214"
			type = "Role"
		}
		resource_access {
			id = "246dd0d5-5bd0-4def-940b-0421030a5b68"
			type = "Role"
		}
	}

#end of replace
}

resource "azuread_service_principal" "service-principal" {
  count                        = var.shared_app_registration_client_id != "" ? 0 : 1
  client_id                    = var.shared_app_registration_client_id != "" ? var.shared_app_registration_client_id : azuread_application.app-registration[0].client_id
  app_role_assignment_required = true
  tags = [
    "Version:${local.v1_terraform_template_version}", # indicate the current version of barebone"
    local.features_template_version
  ]
}

resource "azuread_application_federated_identity_credential" "app-reg-fed-cred" {
  count          = var.shared_app_registration_object_id != "" ? 0 : 1
  application_id = "/applications/${var.shared_app_registration_object_id != "" ? var.shared_app_registration_object_id : azuread_application.app-registration[0].object_id}"
  display_name   = var.federated_credential_display_name
  description    = "Federated Credentials created by Trend Micro Vision One, used for Accessing Azure Resources"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = local.issuer_url
  subject        = local.subject_urn

  depends_on = [
    azuread_application.app-registration
  ]
}

resource "azurerm_role_definition" "custom-role-definition" {
  name        = local.custom_role_name
  scope       = "/subscriptions/${local.subscription_id}"
  description = "This is a custom role created by Trend Micro Vision One"
  permissions {
    actions      = concat(local.barebone_permissions["actions"], local.feature_permissions["actions"])
    data_actions = concat(local.barebone_permissions["data_actions"], local.feature_permissions["data_actions"])
  }
}

resource "azurerm_role_assignment" "role-assignment" {
  scope              = "/subscriptions/${local.subscription_id}"
  role_definition_id = azurerm_role_definition.custom-role-definition.role_definition_resource_id
  principal_id       = var.shared_service_principal_object_id != "" ? var.shared_service_principal_object_id : azuread_service_principal.service-principal[0].object_id

  depends_on = [
    azuread_service_principal.service-principal
  ]
}
