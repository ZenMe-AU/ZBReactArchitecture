#! /bin/bash
source ./functions.sh

ACTION="install" # default action

export CAM_DEPLOYED_REGION="australiasoutheast"
export CLOUD_ACCOUNT_NAME="Jake Azure Pay-As-You-Go"
export CLOUD_ACCOUNT_DESCRIPTION=""
export CONNECTED_SECURITY_SERVICES_JSON='[]'
export ENDPOINT="https://cloudaccounts-au.xdr.trendmicro.com/public/cam/api/ui"
export FEATURES='["cloud-sentry","real-time-posture-monitoring"]'
export FEATURES_DEPLOYED_REGIONS='{
  "cloud-sentry": [
    "australiaeast"
  ],
  "real-time-posture-monitoring": null
}'
export ISSUER_URL="https://cloudaccounts-au.xdr.trendmicro.com"
export SUBSCRIPTION_ID="0930d9a7-2369-4a2d-a0b6-5805ef505868"
export SUBJECT_URN="urn:visionone:identity:au:d8e215a9-2fde-45c0-b633-8d3386b07324:account/d8e215a9-2fde-45c0-b633-8d3386b07324"
export V1_ACCOUNT_ID="d8e215a9-2fde-45c0-b633-8d3386b07324"
export V1_API_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjaWQiOiJkOGUyMTVhOS0yZmRlLTQ1YzAtYjYzMy04ZDMzODZiMDczMjQiLCJjcGlkIjoic3ZwIiwicHBpZCI6ImN1cyIsIml0IjoxNzYxNjE3ODQ0LCJldCI6MTc2OTM5Mzg0NCwiaWQiOiIzOTA5MTZmYS0xOTAxLTQ4YTItYmZlOC01ZjhlZTBmZjhmYTAiLCJ0b2tlblVzZSI6ImN1c3RvbWVyIn0.TTJpKa7qb9hbmpojo0_XF43OpnFzTNhtxBeouNmlOLjceYbUYymr3mrPj35M7Gyc_bI9N5o6vLM1_QdZSGh6LAQWMJiFVZGfb7m1QEFTQwIZKxC3spyaoalx7FopFZXm4QKF-iBA_kmQUPq3gEVtkUni_RpH_kpoR8pPL1C7uMWitfMk-Lo6qW2YwxiM_U8EfOAym91Ad9Dvx_IAbUW-46ChZU0JlGTMcWGaqqyP_BAlGdwxu4j87ptJPxaeJ0WJuDmBBsxEWc8tx0JLkFdEYObyzMQWZVYiDwrTnu0ZIy3jrWJ_UDi80FWYGnO7YoddD0L60wcy5pclxbvhXyu-F0OpikLf3NefWg-7xUKUwMhV-wtEGDgiBoqUloC4MYuen9KQ6X-qMK4ptPQH-hZNgNQJxPfNJoGUhq_gUZFVUHoH05tYn6L5AdeqIj2YBFd9zsWf8O8_feQwYjlX7Nc5jUZjywQyc8xf7wmZ0-1v4oUH_vppNZHvsQBojnhEkC1a3PLrZ1ob4gUjQ2HRlxpJqTMjujB2PqmeQE6vY02UmkX6YSprTZ3a8Qt5jO9MV__r-govIu7tHoVK1wDEPLz7vAyHP1bkOuylSVBuqS69VmbOwcubSuT4VcPtETTF60mKbnvs5zLoJetYeovz0ON9zeT2EPwAvORVb7jBAByFncI"
export AZ_MANAGEMENT_GROUP_ID=""
export AZ_MANAGEMENT_GROUP_NAME=""
export AZ_EXCLUDED_SUBSCRIPTIONS=""

export V1_TERRAFORM_TEMPLATE_VERSION="2.0.1896" # indicate the current version of barebone
export FEATURES_TEMPLATE_VERSION="cloud-sentry=1.158.09041233,real-time-posture-monitoring=1.0.0"
export FEATURE_PERMISSIONS='{actions=["Microsoft.Authorization/classicAdministrators/operationstatuses/read","Microsoft.Authorization/classicAdministrators/read","Microsoft.Authorization/denyAssignments/read","Microsoft.Authorization/diagnosticSettings/read","Microsoft.Authorization/diagnosticSettingsCategories/read","Microsoft.Authorization/locks/delete","Microsoft.Authorization/locks/read","Microsoft.Authorization/locks/write","Microsoft.Authorization/operations/read","Microsoft.Authorization/permissions/read","Microsoft.Authorization/policyAssignments/privateLinkAssociations/read","Microsoft.Authorization/policyAssignments/read","Microsoft.Authorization/policyAssignments/resourceManagementPrivateLinks/privateEndpointConnectionProxies/read","Microsoft.Authorization/policyAssignments/resourceManagementPrivateLinks/privateEndpointConnections/read","Microsoft.Authorization/policyAssignments/resourceManagementPrivateLinks/read","Microsoft.Authorization/policyDefinitions/read","Microsoft.Authorization/policyExemptions/read","Microsoft.Authorization/policySetDefinitions/read","Microsoft.Authorization/providerOperations/read","Microsoft.Authorization/roleAssignmentScheduleInstances/read","Microsoft.Authorization/roleAssignmentScheduleRequests/cancel/action","Microsoft.Authorization/roleAssignmentScheduleRequests/read","Microsoft.Authorization/roleAssignmentScheduleRequests/write","Microsoft.Authorization/roleAssignmentSchedules/read","Microsoft.Authorization/roleAssignments/delete","Microsoft.Authorization/roleAssignments/read","Microsoft.Authorization/roleAssignments/write","Microsoft.Authorization/roleDefinitions/delete","Microsoft.Authorization/roleDefinitions/read","Microsoft.Authorization/roleDefinitions/write","Microsoft.Authorization/roleEligibilityScheduleInstances/read","Microsoft.Authorization/roleEligibilityScheduleRequests/read","Microsoft.Authorization/roleEligibilitySchedules/read","Microsoft.Authorization/roleManagementPolicies/read","Microsoft.Authorization/roleManagementPolicyAssignments/read","Microsoft.Insights/AlertRules/Activated/Action","Microsoft.Insights/AlertRules/Delete","Microsoft.Insights/AlertRules/Incidents/Read","Microsoft.Insights/AlertRules/Read","Microsoft.Insights/AlertRules/Resolved/Action","Microsoft.Insights/AlertRules/Throttled/Action","Microsoft.Insights/AlertRules/Write","Microsoft.Insights/Components/Read","Microsoft.Network/virtualNetworks/subnets/joinViaServiceEndpoint/action","Microsoft.ResourceHealth/AvailabilityStatuses/read","Microsoft.Resources/deployments/cancel/action","Microsoft.Resources/deployments/delete","Microsoft.Resources/deployments/exportTemplate/action","Microsoft.Resources/deployments/validate/action","Microsoft.Resources/deployments/whatIf/action","Microsoft.Resources/deployments/write","Microsoft.ServiceBus/namespaces/read","Microsoft.ServiceBus/namespaces/write","Microsoft.Storage/storageAccounts/PrivateEndpointConnectionsApproval/action","Microsoft.Storage/storageAccounts/accountLocks/delete","Microsoft.Storage/storageAccounts/accountLocks/deleteLock/action","Microsoft.Storage/storageAccounts/accountLocks/read","Microsoft.Storage/storageAccounts/accountLocks/write","Microsoft.Storage/storageAccounts/accountMigrations/read","Microsoft.Storage/storageAccounts/accountMigrations/write","Microsoft.Storage/storageAccounts/blobServices/containers/clearLegalHold/action","Microsoft.Storage/storageAccounts/blobServices/containers/delete","Microsoft.Storage/storageAccounts/blobServices/containers/immutabilityPolicies/delete","Microsoft.Storage/storageAccounts/blobServices/containers/immutabilityPolicies/extend/action","Microsoft.Storage/storageAccounts/blobServices/containers/immutabilityPolicies/lock/action","Microsoft.Storage/storageAccounts/blobServices/containers/immutabilityPolicies/read","Microsoft.Storage/storageAccounts/blobServices/containers/immutabilityPolicies/write","Microsoft.Storage/storageAccounts/blobServices/containers/lease/action","Microsoft.Storage/storageAccounts/blobServices/containers/migrate/action","Microsoft.Storage/storageAccounts/blobServices/containers/read","Microsoft.Storage/storageAccounts/blobServices/containers/setLegalHold/action","Microsoft.Storage/storageAccounts/blobServices/containers/write","Microsoft.Storage/storageAccounts/blobServices/generateUserDelegationKey/action","Microsoft.Storage/storageAccounts/blobServices/providers/Microsoft.Insights/diagnosticSettings/read","Microsoft.Storage/storageAccounts/blobServices/providers/Microsoft.Insights/diagnosticSettings/write","Microsoft.Storage/storageAccounts/blobServices/providers/Microsoft.Insights/logDefinitions/read","Microsoft.Storage/storageAccounts/blobServices/providers/Microsoft.Insights/metricDefinitions/read","Microsoft.Storage/storageAccounts/blobServices/read","Microsoft.Storage/storageAccounts/blobServices/write","Microsoft.Storage/storageAccounts/consumerDataShare/action","Microsoft.Storage/storageAccounts/consumerDataSharePolicies/read","Microsoft.Storage/storageAccounts/consumerDataSharePolicies/write","Microsoft.Storage/storageAccounts/dataSharePolicies/delete","Microsoft.Storage/storageAccounts/dataSharePolicies/read","Microsoft.Storage/storageAccounts/dataSharePolicies/write","Microsoft.Storage/storageAccounts/delete","Microsoft.Storage/storageAccounts/encryptionScopes/hoboConfigurations/read","Microsoft.Storage/storageAccounts/encryptionScopes/hoboConfigurations/write","Microsoft.Storage/storageAccounts/encryptionScopes/read","Microsoft.Storage/storageAccounts/encryptionScopes/write","Microsoft.Storage/storageAccounts/failover/action","Microsoft.Storage/storageAccounts/fileServices/providers/Microsoft.Insights/diagnosticSettings/read","Microsoft.Storage/storageAccounts/fileServices/providers/Microsoft.Insights/diagnosticSettings/write","Microsoft.Storage/storageAccounts/fileServices/providers/Microsoft.Insights/logDefinitions/read","Microsoft.Storage/storageAccounts/fileServices/providers/Microsoft.Insights/metricDefinitions/read","Microsoft.Storage/storageAccounts/fileServices/read","Microsoft.Storage/storageAccounts/fileServices/shares/delete","Microsoft.Storage/storageAccounts/fileServices/shares/lease/action","Microsoft.Storage/storageAccounts/fileServices/shares/read","Microsoft.Storage/storageAccounts/fileServices/shares/restore/action","Microsoft.Storage/storageAccounts/fileServices/shares/write","Microsoft.Storage/storageAccounts/fileServices/usages/read","Microsoft.Storage/storageAccounts/fileServices/write","Microsoft.Storage/storageAccounts/hnsonmigration/action","Microsoft.Storage/storageAccounts/hoboConfigurations/read","Microsoft.Storage/storageAccounts/hoboConfigurations/write","Microsoft.Storage/storageAccounts/inventoryPolicies/delete","Microsoft.Storage/storageAccounts/inventoryPolicies/read","Microsoft.Storage/storageAccounts/inventoryPolicies/write","Microsoft.Storage/storageAccounts/joinPerimeter/action","Microsoft.Storage/storageAccounts/listAccountSas/action","Microsoft.Storage/storageAccounts/listServiceSas/action","Microsoft.Storage/storageAccounts/listkeys/action","Microsoft.Storage/storageAccounts/localUsers/delete","Microsoft.Storage/storageAccounts/localusers/listKeys/action","Microsoft.Storage/storageAccounts/localusers/read","Microsoft.Storage/storageAccounts/localusers/regeneratePassword/action","Microsoft.Storage/storageAccounts/localusers/write","Microsoft.Storage/storageAccounts/managementPolicies/delete","Microsoft.Storage/storageAccounts/managementPolicies/read","Microsoft.Storage/storageAccounts/managementPolicies/write","Microsoft.Storage/storageAccounts/networkSecurityPerimeterAssociationProxies/delete","Microsoft.Storage/storageAccounts/networkSecurityPerimeterAssociationProxies/read","Microsoft.Storage/storageAccounts/networkSecurityPerimeterAssociationProxies/write","Microsoft.Storage/storageAccounts/networkSecurityPerimeterConfigurations/action","Microsoft.Storage/storageAccounts/networkSecurityPerimeterConfigurations/read","Microsoft.Storage/storageAccounts/objectReplicationPolicies/delete","Microsoft.Storage/storageAccounts/objectReplicationPolicies/read","Microsoft.Storage/storageAccounts/objectReplicationPolicies/restorePointMarkers/write","Microsoft.Storage/storageAccounts/objectReplicationPolicies/write","Microsoft.Storage/storageAccounts/privateEndpointConnectionProxies/delete","Microsoft.Storage/storageAccounts/privateEndpointConnectionProxies/read","Microsoft.Storage/storageAccounts/privateEndpointConnectionProxies/updatePrivateEndpointProperties/action","Microsoft.Storage/storageAccounts/privateEndpointConnectionProxies/write","Microsoft.Storage/storageAccounts/privateEndpointConnections/delete","Microsoft.Storage/storageAccounts/privateEndpointConnections/read","Microsoft.Storage/storageAccounts/privateEndpointConnections/write","Microsoft.Storage/storageAccounts/privateEndpoints/move/action","Microsoft.Storage/storageAccounts/privateLinkResources/read","Microsoft.Storage/storageAccounts/providers/Microsoft.Insights/diagnosticSettings/read","Microsoft.Storage/storageAccounts/providers/Microsoft.Insights/diagnosticSettings/write","Microsoft.Storage/storageAccounts/providers/Microsoft.Insights/metricDefinitions/read","Microsoft.Storage/storageAccounts/queueServices/providers/Microsoft.Insights/diagnosticSettings/read","Microsoft.Storage/storageAccounts/queueServices/providers/Microsoft.Insights/diagnosticSettings/write","Microsoft.Storage/storageAccounts/queueServices/providers/Microsoft.Insights/logDefinitions/read","Microsoft.Storage/storageAccounts/queueServices/providers/Microsoft.Insights/metricDefinitions/read","Microsoft.Storage/storageAccounts/queueServices/queues/delete","Microsoft.Storage/storageAccounts/queueServices/queues/read","Microsoft.Storage/storageAccounts/queueServices/queues/write","Microsoft.Storage/storageAccounts/queueServices/read","Microsoft.Storage/storageAccounts/queueServices/write","Microsoft.Storage/storageAccounts/read","Microsoft.Storage/storageAccounts/regeneratekey/action","Microsoft.Storage/storageAccounts/reports/read","Microsoft.Storage/storageAccounts/restoreBlobRanges/action","Microsoft.Storage/storageAccounts/restorePoints/delete","Microsoft.Storage/storageAccounts/restorePoints/read","Microsoft.Storage/storageAccounts/revokeUserDelegationKeys/action","Microsoft.Storage/storageAccounts/rotateKey/action","Microsoft.Storage/storageAccounts/services/diagnosticSettings/write","Microsoft.Storage/storageAccounts/storageTaskAssignments/delete","Microsoft.Storage/storageAccounts/storageTaskAssignments/read","Microsoft.Storage/storageAccounts/storageTaskAssignments/reports/read","Microsoft.Storage/storageAccounts/storageTaskAssignments/write","Microsoft.Storage/storageAccounts/tableServices/providers/Microsoft.Insights/diagnosticSettings/read","Microsoft.Storage/storageAccounts/tableServices/providers/Microsoft.Insights/diagnosticSettings/write","Microsoft.Storage/storageAccounts/tableServices/providers/Microsoft.Insights/logDefinitions/read","Microsoft.Storage/storageAccounts/tableServices/providers/Microsoft.Insights/metricDefinitions/read","Microsoft.Storage/storageAccounts/tableServices/read","Microsoft.Storage/storageAccounts/tableServices/tables/delete","Microsoft.Storage/storageAccounts/tableServices/tables/read","Microsoft.Storage/storageAccounts/tableServices/tables/write","Microsoft.Storage/storageAccounts/tableServices/write","Microsoft.Storage/storageAccounts/updateAccountContainerHoldingPeriod/action","Microsoft.Storage/storageAccounts/updateInternalProperties/action","Microsoft.Storage/storageAccounts/write","Microsoft.Support/checkNameAvailability/action","Microsoft.Support/lookUpResourceId/action","Microsoft.Support/operationresults/read","Microsoft.Support/operations/read","Microsoft.Support/operationsstatus/read","Microsoft.Support/register/action","Microsoft.Support/services/problemClassifications/read","Microsoft.Support/services/read","Microsoft.Support/supportTickets/read","Microsoft.Support/supportTickets/write","Microsoft.Web/serverfarms/Read"],data_actions=["Microsoft.ServiceBus/namespaces/messages/send/action"]}'
export VERSION_TAG="vision-one-deployment-version"
export RESOURCE_GROUP_NAME="trendmicro-v1-$SUBSCRIPTION_ID"
export APP_REGISTRATION_NAME="v1-app-registration-$SUBSCRIPTION_ID"
export CUSTOM_ROLE_NAME="v1-custom-role-$SUBSCRIPTION_ID"

storage_account_name_suffix=$(get_subscription_id_suffix $SUBSCRIPTION_ID)
export TF_STATE_STORAGE_ACCOUNT_NAME="camtfstatestorage${storage_account_name_suffix}"
export TF_STATE_CONTAINER_NAME="camtfstate$SUBSCRIPTION_ID"
export TF_BACKUP_TARGETED_FILE_NAME="terraform.tfstate"
export TF_BACKUP_FILE_NAME="v1-cam-tfstate.bak"
export CAM_OPTIONAL_PARAMS_FILE_NAME="optional_params.json"
export IS_SHARED_APPLICATION=false
export TF_AUTO_APPROVE=false
export TF_BACKUP_SOURCE_PATH="$TF_STATE_STORAGE_ACCOUNT_NAME/$TF_STATE_CONTAINER_NAME/$TF_BACKUP_TARGETED_FILE_NAME"
export TF_BACKUP_TARGETED_PATH="$TF_STATE_STORAGE_ACCOUNT_NAME/$TF_STATE_CONTAINER_NAME/$TF_BACKUP_FILE_NAME"
export IS_CAM_CLOUD_ASRM_ENABLED="true"
export CONFIG_BUCKET_URL=""
export IS_TO_DELETE_CLOUD_ACCOUNT=false
export CHECK_IS_MGMT_GROUP_DEPLOYED=false

TF_PLUGIN_CACHE_DIR="$HOME/.terraform.d/plugin-cache"
if [ ! -d "$TF_PLUGIN_CACHE_DIR" ]; then
  mkdir -p "$TF_PLUGIN_CACHE_DIR"
fi
export TF_PLUGIN_CACHE_DIR=$TF_PLUGIN_CACHE_DIR


function process_optional_params() {
    export SHARED_APP_REGISTRATION_CLIENT_ID=""
    export SHARED_APP_REGISTRATION_OBJECT_ID=""
    export SHARED_SERVICE_PRINCIPAL_OBJECT_ID=""

    while [[ "$#" -gt 0 ]]; do
        case $1 in
        install)
            ACTION="install"
            ;;
        uninstall)
            ACTION="uninstall"
            ;;
        precheck)
            ACTION="precheck"
            ;;
        --app_registration_client_id)
            if [ -n "$2" ]; then
                SHARED_APP_REGISTRATION_CLIENT_ID=$(echo "$2" | xargs)
            fi
            shift
            ;;
        --app_registration_object_id)
            if [ -n "$2" ]; then
                SHARED_APP_REGISTRATION_OBJECT_ID=$(echo "$2" | xargs)
            fi
            shift
            ;;
        --service_principal_object_id)
            if [ -n "$2" ]; then
                SHARED_SERVICE_PRINCIPAL_OBJECT_ID=$(echo "$2" | xargs)
            fi
            shift
            ;;
        --management_group_id)
            if [ -n "$2" ]; then
                AZ_MANAGEMENT_GROUP_ID=$(echo "$2" | xargs)
            fi
            shift
            ;;
        --management_group_name)
            if [ -n "$2" ]; then
                AZ_MANAGEMENT_GROUP_NAME=$(echo "$2" | xargs)
            fi
            shift
            ;;
        --excluded_subscriptions)
            if [ -n "$2" ]; then
                AZ_EXCLUDED_SUBSCRIPTIONS=$(echo "$2" | xargs)
            fi
            shift
            ;;
        --delete_cloud_account)
            IS_TO_DELETE_CLOUD_ACCOUNT=true
            shift
            ;;
        --check_is_mgmt_group_deployed)
            CHECK_IS_MGMT_GROUP_DEPLOYED=true
            ;;
        *)
            echo "[ERROR] Invalid option: $1"
            echo "Usage: $0 [install||uninstall||precheck] [--app_registration_client_id value] [--app_registration_object_id value] [--service_principal_object_id value]"
            exit 1
            ;;
        esac
        shift
    done

    # all of the optional parameters should be all empty or all has value
    if [ -z "$SHARED_APP_REGISTRATION_CLIENT_ID" ] && \
        [ -z "$SHARED_APP_REGISTRATION_OBJECT_ID" ] && \
        [ -z "$SHARED_SERVICE_PRINCIPAL_OBJECT_ID" ]; then
        echo "[INFO] Create new app registration and service principal."
        IS_SHARED_APPLICATION=false
    elif [ -n "$SHARED_APP_REGISTRATION_CLIENT_ID" ] && \
        [ -n "$SHARED_APP_REGISTRATION_OBJECT_ID" ] && \
        [ -n "$SHARED_SERVICE_PRINCIPAL_OBJECT_ID" ]; then
        echo "[INFO] Use the existing app registration and service principal."
        IS_SHARED_APPLICATION=true
    else
        echo "[ERROR] Invalid optional parameters."
        exit 1
    fi
}


main() {
    echo SUBSCRIPTION_ID: $SUBSCRIPTION_ID
    check_required_tools

    az account set --subscription "$SUBSCRIPTION_ID"

    process_optional_params "$@"

    case $ACTION in
    "install")
        installation
        store_optional_params
        ;;
    "uninstall")
        uninstallation
        remove_optional_params
        ;;
    "precheck")
        precheck
        ;;
    *)
        echo "[ERROR] Invalid action: $ACTION"
        echo "Usage: $0 [install|uninstall|precheck]"
        exit 1
        ;;
    esac

}

main "$@"
