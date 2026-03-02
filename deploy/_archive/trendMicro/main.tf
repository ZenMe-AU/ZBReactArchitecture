terraform {
  backend "azurerm" {
    resource_group_name  = "__RESOURCE_GROUP_NAME__"
    storage_account_name = "__TF_STATE_STORAGE_ACCOUNT_NAME__"
    container_name       = "__TF_STATE_CONTAINER_NAME__"
    key                  = "terraform.tfstate"
  }
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=4.3.0"
    }
  }
}

module "cam" {
  source                             = "./cam"
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
  app_registration_display_name      = var.app_registration_display_name
  shared_app_registration_client_id  = var.shared_app_registration_client_id
  shared_app_registration_object_id  = var.shared_app_registration_object_id
  shared_service_principal_object_id = var.shared_service_principal_object_id
  feature_permissions                = var.feature_permissions
}

moved {
  from = azuread_application.app-registration
  to   = module.cam.azuread_application.app-registration
}
moved {
  from = azuread_service_principal.service-principal
  to   = module.cam.azuread_service_principal.service-principal
}
moved {
  from = azuread_application_federated_identity_credential.app-reg-fed-cred
  to   = module.cam.azuread_application_federated_identity_credential.app-reg-fed-cred
}
moved {
  from = azurerm_role_definition.custom-role-definition
  to   = module.cam.azurerm_role_definition.custom-role-definition
}
moved {
  from = azurerm_role_assignment.role-assignment
  to   = module.cam.azurerm_role_assignment.role-assignment
}

module "real-time-posture-monitoring" {
	source = "https://vision-one-cloud-posture-monitoring-us-east-1.s3.us-east-1.amazonaws.com/azure/templates/RealTimePostureMonitoringTemplate.zip"
	primary_region = module.cam.cam_deployed_region
	subscription_id = module.cam.subscription_id
	webhook_config_id = "wxRabAbRl"
	webhook_api_url = "https://rtpm.apm-au.xdr.trendmicro.com/v1/rtm/webhook"
	webhook_api_key = "to9s4PEMVvhbCBmyA3euMZxxe8unxTnj7h9oiPAXpTC6qrgwoHna3npE95zVtL72"
}
module "azure-activity-log" {
    source = "https://v1cs-cloud-audit-log-monitoring-us-east-1.s3.amazonaws.com/azure/aml/latest/clm-aml-template.zip"
    subscription_id = module.cam.subscription_id
    resource_group_location = module.cam.cam_deployed_region
    xlogr_api_endpoint = "https://xlogr-ase2.xdr.trendmicro.com"
    xlogr_xdr_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjaWQiOiJkOGUyMTVhOS0yZmRlLTQ1YzAtYjYzMy04ZDMzODZiMDczMjQiLCJjcGlkIjoiY2xyIiwicHBpZCI6ImFtbCIsIml0IjoxNzYxNjE3ODU0LCJ1aWQiOiIiLCJldCI6MTc2NDIwOTg1MiwidG9rZW5Vc2UiOiJjdXN0b21lciJ9.eYGonGdNf01jwlpabm7ZZjHWa69_33tOlUaKFlwB5iXxEIn85arKk6ok_tMKzx_ATpXQ-SuGOdGAwOT0Gv8P49F62z8kXiDRVnSCaHdLpno7d_kYsOnkOlE8aU9GvXH9eMkL8mNuSeu0a1jU0hOCVrPh4MJTSp_PJ93oUazPkKOkQOBgVInoxaKJ8TdaeLvwjVssc1ZvQssi1m3VTfD2-gOto5S0jRFpdK61dKZpUsyszGNCIDmx2Va1b6uWvsjMiaXn3x5vk7KZ_EDlBhYxLream04HyjjHETxoPfgFBiRKqEiJuaORjt9a4Nmh6EetC2xHmBhWJjk9_xHTe0YQ_e5zeGpnwvv5zsc3s93AR-2qq4qSq7XmPeKtaPvZFUeu4SyQqeD3Rwu1fc9YZPfGyLSDwe5zPHOOta0A4jaoIIuR_KkpgjV81JX0iP1cSRkNoJgE9NIJpIV7xChKTgqC7VOAri94vf6utIbiiki9dxZ2nDozARJNABeKtiT7_TxI5f-NZh9qOOFGFRkr9MfjpxvHICK5OL0cQ4n9EJHSoa8DKJYxn1QQKh1Q3snqiEwLxSfpav2tu9lNk7kSiWqtcVYk3IdfObOqrS36AF5uCH49-11EtDuMPRQmufuWFGUvoQRo6HMB6dfZVEDO1RII7ts-F2zbtbC6cjvBMNW5Z_Y"
    scm_device_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjaWQiOiJkOGUyMTVhOS0yZmRlLTQ1YzAtYjYzMy04ZDMzODZiMDczMjQiLCJjcGlkIjoic3ZwIiwicHBpZCI6InNjbSIsIml0IjoxNzYxNjE3ODU0LCJ1aWQiOiIiLCJldCI6MTc2NDIwOTg1MiwiZGlkIjoiYXp1cmUtYWN0aXZpdHktbG9nIiwidG9rZW5Vc2UiOiJkZXZpY2UifQ.ASXR3sRDFENhRhycsWW31scmn1SS8OtE3M2ieqo-CVIiaX0zZDVYK12jsnriP9lzqE5j-fSeWHTHU7EnBLYQhTgS4u8enGBI-7I4omWcn3lbkS0wwJAwVH8Dy2k1lkEGJw4MqJujZf6VYOvNwKCZv-rakbz0eBxcbgBHPqfvCcIYCVy_FgvDcVbaEyIQB7rj9_pz_889vrJNBsdrzQE_ux5U4r25sjhRHbqc6JDAfPBJV4y3I43f41B4m6uddGSgYZM5DIgQChSXOAU8ZvU1E3KsC6zo_YvOZp21tsDFKnaHvw5AT-dH-sdrp0cy6jCk67GEka3P6ZPMymeuFFnjkh_urBnUfcDvBxg5FkXqSDgVWGp2NDP0GgFmOX3ygpvVDW7JUJPDoilKCBPvbPYkcUZnFaZNf4FloWiOqYqDDMu7oRlUa0Ytiskx22Sdgm5RkqEWmd8g2WScBxZTIqx-Kq7oQNnZHRRZrhOr6uLu0kc3hW1P5qUp-4CvxUc1JAk44jTHDT7c6UBczNimlBwveKnC3beC8Eof2LjeRBF1yQEgT2E2W44UYPtW9vPddPVqxoVhzxgHZALoE5phU3SXO93S6lYT9PMbI5TouPASX5Am7bdbqvvDt0_ETfD_kBQvy-Vy9ZJYqNUSuEw2nydiJBeyeOxatj8HPt5j4tlZH3k"
    v1_account_id = module.cam.v1_account_id
    sp_api_endpoint = "https://api.au.xdr.trendmicro.com"
}
module "cloud-sentry" {
    source = "https://cloud-one-sentry-ap-southeast-2.s3.ap-southeast-2.amazonaws.com/azure/templates/latest/CloudSentryAzureTemplate.zip"
    tenant_id = module.cam.tenant_id
    subscription_id = module.cam.subscription_id
    primary_location = module.cam.cam_deployed_region
    locations = {
      "sentry" : module.cam.available_feature_regions["cloud-sentry"]
      "phoenix" : ["westus"]
    }
    features = {
      "sentry" : true
      "phoenix" : false
    }
    api_endpoint = "https://sentry.au-1.cloudone.trendmicro.com"
    RESOURCE_PREFIX = {
      "common" : "v1common${substr(sha1("d8e215a9-2fde-45c0-b633-8d3386b07324${module.cam.subscription_id}"), 0, 8)}"
      "sentry" : "v1avtd${substr(sha1("d8e215a9-2fde-45c0-b633-8d3386b07324${module.cam.subscription_id}"), 0, 8)}"
      "phoenix" : "v1vpcflowlogs${substr(sha1("d8e215a9-2fde-45c0-b633-8d3386b07324${module.cam.subscription_id}"), 0, 8)}"
    }
    bootstrap_token = "eyJ0eXBlIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJ3d3cudHJlbmRtaWNyby5jb20iLCJleHAiOjE3NjIyMjI2NTYsIm5iZiI6MTc2MTYxNzg1NiwiaWF0IjoxNzYxNjE3ODU2LCJzdWIiOiJkOGUyMTVhOS0yZmRlLTQ1YzAtYjYzMy04ZDMzODZiMDczMjQiLCJ2aXNpb25PbmUiOnsiYWNjb3VudCI6ImQ4ZTIxNWE5LTJmZGUtNDVjMC1iNjMzLThkMzM4NmIwNzMyNCJ9fQ.IiiC07-2vPPW4yO7X9jMU5L5GVDds-dzu6DLgDZ8gMZTIflc6wcTHVb3cCBC8YPu64Wf07Ga_6_Rn7QyAjfevluZVYDYs_o1fnbRfVlsb8bB6WaJCyHdFJDTxYVXnafGIf6WRjSSb9d6B2GJTArGWfzHl9YtpI-mB0Xz5Mk31_DdEt2O6lBnoWnr9A6OVovO6AIc2YmNMjRQ1FgzoNvFsUgCKNbxlF-Md2ERdz6fQOE63omjrUzvmMdjvFHuSrV12qGhRKA1KoAV-1OL2h_IAtkAVlCat6PPj5w3T5FQwu4AfwYENvK3uI3TiisxzzUK6cKFWL6h0HRhcUau6H5OEQ"
    backend_region = "ap-southeast-2"
    stage = "prod"
    visionone_customer_id = "d8e215a9-2fde-45c0-b633-8d3386b07324"
  }
module "data-security-posture-management" {
   source = "https://stack-assets-dspm-prod-us-east-1.s3.us-east-1.amazonaws.com/azure/latest/terraform_template.zip"
   azure_locations = module.cam.available_feature_regions["data-security-posture-management"]
   azure_subscription_id = module.cam.subscription_id
   stage = "prod"
   sp_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjaWQiOiJkOGUyMTVhOS0yZmRlLTQ1YzAtYjYzMy04ZDMzODZiMDczMjQiLCJjcGlkIjoic3ZwIiwicHBpZCI6ImFkcyIsIml0IjoxNzYxNjE3ODU3LCJ1aWQiOiIiLCJldCI6MTc2MjIyMjY1NywiZGlkIjoiZDhlMjE1YTktMmZkZS00NWMwLWI2MzMtOGQzMzg2YjA3MzI0IiwidG9rZW5Vc2UiOiJkZXZpY2UifQ.TZsgEwgu-qU0Mz-_FjDuOC1AvS2yCMnTEPWfznN171Gh3k3EjMzrqOI-L-CVBpwwIl9MxQCKLaV7ZLjNiyPLw8q7ROBzMVvaeStMVJ6rDTnxCgVBD_kwyqUIcdfYD2LIM5z3C3ddQdjAdEQvpElESRDu70MO2MO69QDSdprxf_FRdmXUX0l0t-okHMqUu4OrXK09RRSPIlIpEII-gtSCs1GFlzmKhMBMXSGv7yRX5V3V07tZAYepbX4-ORNOo_XGaR1brkfwaHo-QaGFlssIbocL4gAn5S8yN7zR9dxd0wLdhvdtO9nRWUp42ayoDtl8oKIplo-sHDRhQItvnpH5PqwBrxFA2ncXn1J-7BTFcrddP_9ixkk9exGMoOHZNmPo0AoQyx-NSsedHC7hbq-0v60hp_nTpGVPLuPkR6MM05umhxziHLgEfcWqe8JybhVx7xGlMgiY35VTG9OUaPTNWeDz0uAm95vMaN4SVJS_2a8N8J3G6yrhhrTe5-KltnViKJbJhsznqi6LR88cFjOLBoFTTFl39tXDd0OCVrE-EGTCdAlvVLq8llh6fkgbGyIAiFxk-4aD_ss5uBpQU1fySWnFBA1jxCDPMXZbK9DDsotper1ItSU67xSslqmAVF8xbtf-ZoZDzf6IQOrrD_sWmsMTog0a1l0Vb-pR2BR6rgg"
   sp_api_endpoint = "https://api.au.xdr.trendmicro.com"
   template_ver = "v0.123.14"
   download_url = "https://download.xdr.trendmicro.com"
}
module "microsoft-defender-for-endpoint" {
    source = "https://v1cs-cloud-audit-log-monitoring-us-east-1.s3.amazonaws.com/azure/mde/latest/clm-mde-template.zip"
    subscription_id = module.cam.subscription_id
    resource_group_location = module.cam.cam_deployed_region
    xlogr_api_endpoint = "https://xlogr-ase2.xdr.trendmicro.com"
    xlogr_xdr_token = ""
    xlogr_crem_token = ""
    configuration_setting = "CREM"
    scm_device_token = ""
    sp_api_endpoint = "https://api.au.xdr.trendmicro.com"
}