#!/bin/bash
# shellcheck disable=SC2153

function print_error() {
  local message=$1
  echo -e "\033[31m $message\033[0m"
}

function print_warn() {
    local message=$1
    echo -e "\033[33m $message\033[0m"
}

function get_app_registration_id() {
    local app_registration_name=$1
    if [ -z "$app_registration_name" ]; then
        print_error "[ERROR] App registration name is required"
        return 1
    fi

    local app_id=$(az ad app list --display-name "$app_registration_name" --query "[].appId" -o tsv)
    if [ -z "$app_id" ]; then
        echo "none"
    else
        echo "$app_id"
    fi
}

function get_service_principle_id() {
    local service_principal_name=$1
    if [ -z "$service_principal_name" ]; then
        print_error "[ERROR] Service principal name is required"
        return 1
    fi

    local sp_id=$(az ad sp list --display-name "$service_principal_name" --query "[].id" -o tsv)
    if [ -z "$sp_id" ]; then
        echo "none"
    else
        echo "$sp_id"
    fi
}

function get_custom_role_id() {
    local role_name=$1
    if [ -z "$role_name" ]; then
        print_error "[ERROR] Role name is required"
        exit 1
    fi

    # Get the custom role definition ID
    local role_id
    role_id=$(az role definition list --name "$role_name" --query "[].name" -o tsv)
    if [ -z "$role_id" ]; then
        echo "none"
    fi
    echo "$role_id"
}

function wait_for_custom_role_deletion() {
    local role_name=$1
    local timeout=$2  # Timeout in seconds
    local start_time
    start_time=$(date +%s)

    local role_id
    role_id=$(get_custom_role_id "$role_name")
    while [ "$role_id" != "none" ]; do
        local current_time
        current_time=$(date +%s)
        local elapsed_time=$((current_time - start_time))

        if [ $elapsed_time -ge $timeout ]; then
            print_error "[ERROR] Timeout reached while waiting for custom role to be deleted"
            print_error "Please delete it manually role_id=$role_id, name=$role_name"
            return 1
        fi

        echo "[INFO] Waiting for custom role to be deleted..."
        sleep 5
        role_id=$(get_custom_role_id "$role_name")
    done

    echo "[INFO] Custom role deleted successfully"
    return 0
}

function delete_custom_role_with_assignments() {
    local role_name=$1
    if [ -z "$role_name" ]; then
        print_error "[ERROR] Role name is required"
        return 1
    fi

    # Get the custom role definition ID
    local role_id
    role_id=$(get_custom_role_id "$role_name")
    if [ "$role_id" == "none" ]; then
        echo "[INFO] No custom role found with the name $role_name, skip deletion"
        return 0
    fi

    # List all role assignments for the custom role
    local role_assignments
    role_assignments=$(az role assignment list --role "$role_id" --query "[].id" -o tsv)
    if [ -z "$role_assignments" ]; then
        echo "[INFO] No role assignments found for the role $role_name"
    else
        # Remove each role assignment
        for assignment_id in $role_assignments; do
            if az role assignment delete --ids "$assignment_id"; then
                echo "[INFO] Deleted role assignment with ID $assignment_id"
            else
                print_error "[ERROR] Failed to delete role assignment with ID $assignment_id"
                return 1
            fi
        done
    fi

    # Delete the custom role
    if az role definition delete --name "$role_id"; then
        echo "[INFO] Deleted custom role with ID $role_id"

        if ! wait_for_custom_role_deletion "$custom_role_name" 60; then
            print_error "[ERROR] Failed to wait for custom role to be deleted"
            return 1
        fi
    else
        echo "[ERROR] Failed to delete custom role with ID $role_id"
        return 1
    fi
    return 0
}

function wait_for_app_registration_id_deleted() {
    local app_registration_name=$1
    local timeout=$2  # Timeout in seconds
    local start_time
    start_time=$(date +%s)

    local app_registration_id
    app_registration_id=$(get_app_registration_id "$app_registration_name")
    while [ "$app_registration_id" != "none" ]; do
        local current_time
        current_time=$(date +%s)
        local elapsed_time=$((current_time - start_time))

        if [ $elapsed_time -ge $timeout ]; then
            print_error "[ERROR] Timeout reached while waiting for app registration deletion"
            print_error "Please delete it manually app_registration_id=$app_registration_id, name=$app_registration_name"
            return 1
        fi

        echo "[INFO] Waiting for app registration to be deleted..."
        sleep 5
        app_registration_id=$(get_app_registration_id "$app_registration_name")
    done

    return 0
}

function clean_up_app_registration_and_service_principal() {
    echo "[INFO] Checking existing app registration and service principal with missing tf state..."
    local subscription_id=$1
    local tf_state_storage_account_name=$2
    local resource_group_name=$3

    local app_registration_name
    local custom_role_name

    # make the value reference to global variable
    app_registration_name="${APP_REGISTRATION_NAME}"
    custom_role_name="${CUSTOM_ROLE_NAME}"
    if [ -z "$subscription_id"  ] || \
        [ -z "$tf_state_storage_account_name" ] || \
        [ -z "$resource_group_name" ]; then
        print_error "[ERROR] Missing required parameters"
        return 1
    fi

    local is_tf_state_bucket_exist
    local app_registration_id
    local custom_role_id
    is_tf_state_bucket_exist=$(az storage account show --name "$tf_state_storage_account_name" \
        --resource-group "$resource_group_name" 2>/dev/null && echo "true" || echo "false")

    app_registration_id=$(get_app_registration_id "$app_registration_name")
    if [ ! -f "../terraform.tfstate" ] && [ "$is_tf_state_bucket_exist" == "false" ] && [ "$app_registration_id" != "none" ]; then
            echo "[INFO] Detecting existing app registration, but tf state not found"
            echo "[INFO] Deleting existing app registration then create new..."

            if ! az ad app delete --id "$app_registration_id"; then
                print_error "[ERROR] Failed to delete app registration"
                print_error "Please delete it manually app_registration_id=$app_registration_id, name=$app_registration_name"
                return 1
            else
                echo "[INFO] Deleted old app registration successfully, will create a new one to instead"
            fi

            if ! wait_for_app_registration_id_deleted "$app_registration_name" 60; then
                print_error "[ERROR] Failed to wait for app registration ID to be available"
                return 1
            fi
    fi

    custom_role_id=$(get_custom_role_id "$custom_role_name")
    if [ ! -f "../terraform.tfstate" ] && [ "$is_tf_state_bucket_exist" == "false" ] && [ "$custom_role_id" != none ]; then
        echo "[INFO] Detecting existing VisionOne custom role, but tf state not found"
        echo "[INFO] Deleting existing VisionOne custom role then create new..."

        if ! delete_custom_role_with_assignments "$custom_role_name"; then
            print_error "[ERROR] Failed to delete custom role"
            print_error "Please delete it manually custom_role_name=$custom_role_name"
            return 1
        else
            echo "[INFO] Deleted old custom role successfully, will create a new one to instead"
        fi
    fi

    return 0
}

function check_required_tools() {
	echo "[INFO] Checking required tools..."

    # Get the current version of Bash
    current_version=$(bash --version | head -n1 | cut -d' ' -f4 | cut -d'.' -f1)
    if (( current_version < 5 )); then
        print_error "[ERROR] Bash version is less than 5. Please upgrade Bash to version 5 or later."
        exit 1
    fi

	local required_tools=("az" "terraform" "jq" "timeout")
	local installed_filename=".installed_tools.txt"
	if [ -f "$installed_filename" ]; then
		rm -f $installed_filename
	fi
	for tool in "${required_tools[@]}"; do
		if ! type -P "$tool" &>/dev/null; then
			print_error "[ERROR] $tool is not installed. Please install it first."
			exit 1
		else
			case $tool in
			"az")
				local version_info=$(az version)
				local azure_version=$(echo $version_info | awk -F'"' '/"azure-cli"/ {print $4}')
				echo "[INFO] az version: $azure_version"
				echo "[az] version: $azure_version" >>$installed_filename
				;;
			"terraform")
				local version_info=$(terraform version -json)
				local terraform_version=$(echo $version_info | jq -r '.terraform_version')
				local platform=$(echo $version_info | jq -r '.platform')
				local terraform_outdated=$(echo $version_info | jq -r '.terraform_outdated')
				echo "[INFO] Terraform version: $terraform_version, Platform: $platform, Outdated: $terraform_outdated"
				echo "[terraform] version: $terraform_version, platform: $platform, outdated: $terraform_outdated" >>$installed_filename
				;;
			"jq")
				local jq_version=$(jq --version)
				echo "[INFO] jq version: $jq_version"
				echo "[jq] version: $jq_version" >>$installed_filename
				;;
            "timeout")
				local timeout_version=$(timeout --version)
                echo "[INFO] timeout version: $timeout_version"
				echo "[timeout] version: $timeout_version" >>$installed_filename
				;;
			*)
				echo "[INFO] $tool is installed"
				;;
			esac
		fi
	done

	# Add Updated Timestamp to the installed tools file by the format: 2021-09-30 15:30:00
	echo "Information updated at $(date '+%Y-%m-%d %H:%M:%S')" >>$installed_filename
}

function check_required_env_vars() {
    echo "[INFO] Checking required environment variables..."
    local required_vars=(
        "TF_STATE_CONTAINER_NAME"
        # Deployment parameters
        "SUBSCRIPTION_ID"
        "SUBJECT_URN"
        "CLOUD_ACCOUNT_NAME"
        "V1_ACCOUNT_ID"
        "V1_API_KEY"
        "ENDPOINT"
    )
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "[ERROR] Environment variable $var is not set or empty"
            exit 1
        fi
    done
    echo "[INFO] All required environment variables are set."
}

function create_terraform_state_bucket() {
    # register MS.Storage provider
    az provider register --namespace Microsoft.Storage

	# Check if the resource group exists
	if ! az group show --name "$RESOURCE_GROUP_NAME" >/dev/null 2>&1; then
		echo "[INFO] Resource group does not exist, creating..."
		if ! az group create --name "$RESOURCE_GROUP_NAME" --location "$CAM_DEPLOYED_REGION"; then
			print_error "[ERROR] Failed to create resource group"
			return 1
		fi
	else
		echo "[INFO] Resource group already exists, skipping creation."
	fi
	# Check if the storage account exists
    if ! az storage account show --name "$TF_STATE_STORAGE_ACCOUNT_NAME" --resource-group "$RESOURCE_GROUP_NAME" >/dev/null 2>&1; then
        echo "[INFO] Storage account does not exist, creating..."

        # Create storage account
        if ! az storage account create \
            --name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
            --resource-group "$RESOURCE_GROUP_NAME" \
            --location "$CAM_DEPLOYED_REGION" \
            --sku Standard_LRS \
            --kind StorageV2 \
            --min-tls-version TLS1_2 \
            --allow-blob-public-access false \
            --require-infrastructure-encryption true; then
            print_error "[ERROR] Failed to create storage account"
            return 1
        fi

        # Wait for storage account creation to propagate
        echo "[INFO] Waiting for the storage account to be fully available..."
        sleep 10
    else
        echo "[INFO] Storage account already exists, skipping creation."
    fi
    # Check if the blob container exists
    if ! az storage container show \
        --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
        --name "$TF_STATE_CONTAINER_NAME" >/dev/null 2>&1; then
        echo "[INFO] Blob container does not exist, creating..."

        # Create blob container
        if ! az storage container create \
            --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
            --name "$TF_STATE_CONTAINER_NAME"; then
            print_error "[ERROR] Failed to create blob container"
            return 1
        fi

        echo "[INFO] Blob container created successfully."
    else
        echo "[INFO] Blob container already exists, skipping creation."
    fi
    # Enable versioning on the storage account
    echo "[INFO] Enabling blob versioning on the storage account..."
    if ! az storage account blob-service-properties update \
        --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
        --enable-versioning true; then
        print_error "[ERROR] Failed to enable blob versioning"
        return 1
    fi
    # Enable soft delete on the storage account
    echo "[INFO] Enabling blob soft delete on the storage account..."
    if ! az storage blob service-properties delete-policy update \
        --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
        --enable true \
        --days-retained 30; then
        print_error "[ERROR] Failed to enable blob soft delete"
        return 1
    fi

    echo "[INFO] Terraform state storage setup completed successfully."

	return 0
}

function upload_deployment_info_to_state_bucket() {
    # Check if the storage account exists
    if ! az storage account show --name "$TF_STATE_STORAGE_ACCOUNT_NAME" --resource-group "$RESOURCE_GROUP_NAME" >/dev/null 2>&1; then
        print_error "[ERROR] Storage Account does not exist. Cannot upload files to the state container."
        return 1
    fi
    # Check if the blob container exists
    if ! az storage container show --name "$TF_STATE_CONTAINER_NAME" --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" >/dev/null 2>&1; then
        print_error "[ERROR] Blob container does not exist. Cannot upload files to the state container."
        return 1
    fi
    # Check if the file exists locally
    local installed_filename=".installed_tools.txt"
    if [ -f "${installed_filename}" ]; then
        # Upload the file to the blob container
        if ! az storage blob upload \
            --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
            --container-name "$TF_STATE_CONTAINER_NAME" \
            --name "${installed_filename}" \
            --file "${installed_filename}" \
					--overwrite; then
            print_error "[ERROR] Failed to upload '${installed_filename}' to the state container"
            return 1
        else
            echo "[INFO] Uploaded '${installed_filename}' to the state container"
        fi
    else
        echo "[INFO] File '${installed_filename}' does not exist locally. Skipping upload"
        return 1
    fi
    echo "[INFO] Blob container updated successfully"
    return 0
}

function configure_terraform_backend() {
    if [ ! -f "main.tf" ]; then
        print_error "[ERROR] main.tf file not found in the current directory"
        return 1
    fi
    sed "s/__RESOURCE_GROUP_NAME__/$RESOURCE_GROUP_NAME/g" main.tf > main.tf.tmp && mv main.tf.tmp main.tf
    sed "s/__TF_STATE_STORAGE_ACCOUNT_NAME__/$TF_STATE_STORAGE_ACCOUNT_NAME/g" main.tf > main.tf.tmp && mv main.tf.tmp main.tf
    sed "s/__TF_STATE_CONTAINER_NAME__/$TF_STATE_CONTAINER_NAME/g" main.tf > main.tf.tmp && mv main.tf.tmp main.tf
    return 0
}

function remove_feature_module_block() {
    local feature=$1
    if [ -z "$feature" ]; then
        echo "[ERROR] Feature name is required"
        return 1
    fi

    awk -v feature="$feature" '
        BEGIN { found=0; depth=0 }
        /module[[:space:]]*"'"$feature"'"[[:space:]]*{/ { found=1; depth=1; next }
        found && /{/ { depth++ }
        found && /}/ { depth--; if (depth == 0) { found=0; next } }
        !found { print }
        ' main.tf > main.tf.tmp && mv main.tf.tmp main.tf
}

function terraform_init_and_apply_cam_resources() {
    handle_cam_output_blob download
    if ! process_disabled_azure_features; then
        print_error "[ERROR] Failed to process disabled features."
        return 1
    fi

	if ! terraform init -migrate-state -upgrade; then
		print_error "[ERROR] Terraform init failed!"
		return 1
	fi

	local tf_auto_approve_flag=
	if [ "$TF_AUTO_APPROVE" == "true" ]; then
        tf_auto_approve_flag=" -auto-approve"
    fi

    if [ -n "$DISABLED_FEATURES" ] && [ -f "vision-one-cam-output.json" ]; then
		for feature in $DISABLED_FEATURES; do
			echo "Check if require to remove non-present '$feature' provider configuration"
			module_path="module.$feature"
			# Destroy non-present feature from the state
			if terraform state list | grep -q "$module_path"; then
                echo "Starting to destroy $feature module..."
                FEATURES_DEPLOYED_REGIONS=$(echo "$FEATURES_DEPLOYED_REGIONS" | jq --arg feature "$feature" 'if has($feature) then .[$feature] = [] else .[$feature] = [] end')
                terraform destroy -auto-approve \
					-target ${module_path} \
					-var "cam_deployed_region=$CAM_DEPLOYED_REGION" \
                    -var "cloud_account_name=$CLOUD_ACCOUNT_NAME" \
                    -var "cloud_account_description=$CLOUD_ACCOUNT_DESCRIPTION" \
                    -var "connected_security_services_json=$CONNECTED_SECURITY_SERVICES_JSON" \
                    -var "custom_role_name=$CUSTOM_ROLE_NAME" \
                    -var "endpoint=$ENDPOINT" \
                    -var "features=$FEATURES" \
                    -var "features_deployed_regions=$FEATURES_DEPLOYED_REGIONS" \
                    -var "issuer_url=$ISSUER_URL" \
                    -var "subject_urn=$SUBJECT_URN" \
                    -var "subscription_id=$SUBSCRIPTION_ID" \
                    -var "template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
                    -var "v1_account_id=$V1_ACCOUNT_ID" \
                    -var "v1_api_key=$V1_API_KEY" \
                    -var "v1_terraform_template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
                    -var "app_registration_display_name=$APP_REGISTRATION_NAME" \
                    -var "features_template_version=$FEATURES_TEMPLATE_VERSION" \
                    -var "feature_permissions=$FEATURE_PERMISSIONS"
				if [ $? -eq 0 ]; then
                    terraform output -json >vision-one-cam-output.json
                    FEATURES_DEPLOYED_REGIONS=$(echo "$FEATURES_DEPLOYED_REGIONS" | jq --arg feature "$feature" 'del(.[$feature])')
                    echo "Reset the FEATURES_DEPLOYED_REGIONS to $FEATURES_DEPLOYED_REGIONS"
                    remove_feature_module_block "$feature"
                    jq --argjson FEATURES_DEPLOYED_REGIONS "$FEATURES_DEPLOYED_REGIONS" '. + { "available_feature_regions": $FEATURES_DEPLOYED_REGIONS }' vision-one-cam-output.json > vision-one-cam-output.json.tmp && mv vision-one-cam-output.json.tmp vision-one-cam-output.json
					echo "Terraform destroy $feature module completed successfully."
				else
					echo "Terraform destroy $feature module failed."
					return 1
                fi
            fi
		done

		echo "[INFO] Applying the remaining features changes..."
		if ! terraform apply$tf_auto_approve_flag \
                -var "cam_deployed_region=$CAM_DEPLOYED_REGION" \
                -var "cloud_account_name=$CLOUD_ACCOUNT_NAME" \
                -var "cloud_account_description=$CLOUD_ACCOUNT_DESCRIPTION" \
                -var "connected_security_services_json=$CONNECTED_SECURITY_SERVICES_JSON" \
                -var "custom_role_name=$CUSTOM_ROLE_NAME" \
                -var "endpoint=$ENDPOINT" \
                -var "features=$FEATURES" \
                -var "features_deployed_regions=$FEATURES_DEPLOYED_REGIONS" \
                -var "issuer_url=$ISSUER_URL" \
                -var "subject_urn=$SUBJECT_URN" \
                -var "subscription_id=$SUBSCRIPTION_ID" \
                -var "template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
                -var "v1_account_id=$V1_ACCOUNT_ID" \
                -var "v1_api_key=$V1_API_KEY" \
                -var "v1_terraform_template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
                -var "app_registration_display_name=$APP_REGISTRATION_NAME" \
                -var "features_template_version=$FEATURES_TEMPLATE_VERSION" \
                -var "shared_app_registration_client_id=$SHARED_APP_REGISTRATION_CLIENT_ID" \
                -var "shared_app_registration_object_id=$SHARED_APP_REGISTRATION_OBJECT_ID" \
                -var "shared_service_principal_object_id=$SHARED_SERVICE_PRINCIPAL_OBJECT_ID"\
                -var "feature_permissions=$FEATURE_PERMISSIONS"; then
            print_error "[ERROR] Terraform apply failed!"
            return 1
        fi
        terraform output -json >vision-one-cam-output.json

	else
        if ! terraform apply$tf_auto_approve_flag \
            -var "cam_deployed_region=$CAM_DEPLOYED_REGION" \
            -var "cloud_account_name=$CLOUD_ACCOUNT_NAME" \
            -var "cloud_account_description=$CLOUD_ACCOUNT_DESCRIPTION" \
            -var "connected_security_services_json=$CONNECTED_SECURITY_SERVICES_JSON" \
            -var "custom_role_name=$CUSTOM_ROLE_NAME" \
            -var "endpoint=$ENDPOINT" \
            -var "features=$FEATURES" \
            -var "features_deployed_regions=$FEATURES_DEPLOYED_REGIONS" \
            -var "issuer_url=$ISSUER_URL" \
            -var "subject_urn=$SUBJECT_URN" \
            -var "subscription_id=$SUBSCRIPTION_ID" \
            -var "template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
            -var "v1_account_id=$V1_ACCOUNT_ID" \
            -var "v1_api_key=$V1_API_KEY" \
            -var "v1_terraform_template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
            -var "app_registration_display_name=$APP_REGISTRATION_NAME" \
            -var "features_template_version=$FEATURES_TEMPLATE_VERSION" \
            -var "shared_app_registration_client_id=$SHARED_APP_REGISTRATION_CLIENT_ID" \
            -var "shared_app_registration_object_id=$SHARED_APP_REGISTRATION_OBJECT_ID" \
            -var "shared_service_principal_object_id=$SHARED_SERVICE_PRINCIPAL_OBJECT_ID"\
            -var "feature_permissions=$FEATURE_PERMISSIONS"; then
            print_error "[ERROR] Terraform apply failed!"
            return 1
        fi
        terraform output -json >vision-one-cam-output.json
    fi

	export APP_REGISTRATION_ID=$(jq '.["app_registration_id"].value' vision-one-cam-output.json)
    export SERVICE_PRINCIPAL_OBJECT_ID=$(jq '.["service_principal_object_id"].value' vision-one-cam-output.json)
    export TENANT_ID=$(jq '.["tenant_id"].value' vision-one-cam-output.json)

	echo "app_registration_id=${APP_REGISTRATION_ID}"
	echo "service_principal_objectid=${SERVICE_PRINCIPAL_OBJECT_ID}"
    echo "tenant_id=${TENANT_ID}"

    available_feature_regions=$(jq '.["available_feature_regions"].value // []' vision-one-cam-output.json)
    if [ "$available_feature_regions" == "{}" ]; then
        AVAILABLE_FEATURE_REGIONS="[]"
    else
        AVAILABLE_FEATURE_REGIONS=$(echo "$available_feature_regions" | jq -c 'to_entries | map({id: .key, regions: .value})')
    fi
    export AVAILABLE_FEATURE_REGIONS

    handle_cam_output_blob upload

	if [ -z "$APP_REGISTRATION_ID" ] || [ -z "$SERVICE_PRINCIPAL_OBJECT_ID" ] || [ -z "$TENANT_ID" ]; then
        print_error "[ERROR] Terraform apply failed. Lost the required resources."
        return 1
    else
        echo "[INFO] Terraform apply completed successfully."
    fi
	return 0
}

function terraform_destroy_cam_resources() {

    if ! terraform init -migrate-state -upgrade; then
        print_error "[ERROR] Terraform init failed!"
        return 1
    fi

    local tf_auto_approve_flag=
    if [ "$TF_AUTO_APPROVE" == "true" ]; then
        tf_auto_approve_flag=" -auto-approve"
    fi

	if terraform destroy$tf_auto_approve_flag \
		-var "cam_deployed_region=$CAM_DEPLOYED_REGION" \
		-var "cloud_account_name=$CLOUD_ACCOUNT_NAME" \
		-var "cloud_account_description=$CLOUD_ACCOUNT_DESCRIPTION" \
		-var "connected_security_services_json=$CONNECTED_SECURITY_SERVICES_JSON" \
        -var "custom_role_name=$CUSTOM_ROLE_NAME" \
		-var "endpoint=$ENDPOINT" \
		-var "features=$FEATURES" \
		-var "features_deployed_regions=$FEATURES_DEPLOYED_REGIONS" \
		-var "issuer_url=$ISSUER_URL" \
		-var "subject_urn=$SUBJECT_URN" \
		-var "subscription_id=$SUBSCRIPTION_ID" \
		-var "template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
		-var "v1_account_id=$V1_ACCOUNT_ID" \
		-var "v1_api_key=$V1_API_KEY" \
		-var "v1_terraform_template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
		-var "app_registration_display_name=$APP_REGISTRATION_NAME" \
		-var "features_template_version=$FEATURES_TEMPLATE_VERSION" \
		-var "shared_app_registration_client_id=$SHARED_APP_REGISTRATION_CLIENT_ID" \
        -var "shared_app_registration_object_id=$SHARED_APP_REGISTRATION_OBJECT_ID" \
        -var "shared_service_principal_object_id=$SHARED_SERVICE_PRINCIPAL_OBJECT_ID"\
        -var "feature_permissions=$FEATURE_PERMISSIONS"; then
        echo "[INFO] Terraform destroy completed successfully."
        terraform output -json >vision-one-cam-output.json
    else
        print_error "[ERROR] Terraform destroy failed."
        return 1
    fi

}

function terraform_init_and_plan() {
	if ! terraform init -migrate-state -upgrade; then
		print_error "[ERROR] Terraform init failed!"
		return 1
	fi

	if ! terraform plan \
		-var "cam_deployed_region=$CAM_DEPLOYED_REGION" \
		-var "cloud_account_name=$CLOUD_ACCOUNT_NAME" \
		-var "cloud_account_description=$CLOUD_ACCOUNT_DESCRIPTION" \
		-var "connected_security_services_json=$CONNECTED_SECURITY_SERVICES_JSON" \
        -var "custom_role_name=$CUSTOM_ROLE_NAME" \
		-var "endpoint=$ENDPOINT" \
		-var "features=$FEATURES" \
		-var "features_deployed_regions=$FEATURES_DEPLOYED_REGIONS" \
		-var "issuer_url=$ISSUER_URL" \
		-var "subject_urn=$SUBJECT_URN" \
		-var "subscription_id=$SUBSCRIPTION_ID" \
		-var "template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
		-var "v1_account_id=$V1_ACCOUNT_ID" \
		-var "v1_api_key=$V1_API_KEY" \
		-var "v1_terraform_template_version=$V1_TERRAFORM_TEMPLATE_VERSION" \
		-var "app_registration_display_name=$APP_REGISTRATION_NAME" \
		-var "features_template_version=$FEATURES_TEMPLATE_VERSION" \
		-var "shared_app_registration_client_id=$SHARED_APP_REGISTRATION_CLIENT_ID" \
        -var "shared_app_registration_object_id=$SHARED_APP_REGISTRATION_OBJECT_ID" \
        -var "shared_service_principal_object_id=$SHARED_SERVICE_PRINCIPAL_OBJECT_ID"\
        -var "feature_permissions=$FEATURE_PERMISSIONS"; then
            print_error "[ERROR] Terraform plan failed!"
            return 1
    fi
}

function vision_one_cloud_account_sync () {
    echo "[INFO] Setting parameters..."
    auth=$V1_API_KEY
    subscription_id=$SUBSCRIPTION_ID
    v1_account_id=$V1_ACCOUNT_ID
    http_endpoint=$ENDPOINT
    list_accounts_url="$http_endpoint/azureSubscriptions/$subscription_id"
    add_account_url="$http_endpoint/azureSubscriptions"
    modify_account_url="$http_endpoint/azureSubscriptions/$subscription_id"
    x_task_id="$(uuidgen)"
    x_trace_id="$(uuidgen)"

    BASE_DELAY=20  # Set a base retry delay (in seconds)
    MAX_RETRIES=6  # Set the maximum number of retries
    BACKOFF_FACTOR=2  # Set the backoff factor (multiplier for delay after each retry)

    # Ensure required variables are not empty
    if [ -z "$auth" ] || [ -z "$subscription_id" ] || [ -z "$v1_account_id" ] || [ -z "$http_endpoint" ]; then
        print_error "[ERROR] One or more required environment variables are missing."
        exit 1
    fi

    echo "[INFO] Getting Azure account information..."
    response_body=$(curl -s -o /tmp/response_body.json -w "%{http_code}" -X GET "$list_accounts_url" \
        -H "Authorization: Bearer $auth" \
        -H "Content-Type: application/json" \
        -H "x-user-role: Master Administrator" \
        -H "x-customer-id: $v1_account_id" \
        -H "x-task-id: $x_task_id" \
        -H "x-trace-id: $x_trace_id")

    status_code="$response_body"
    cloud_account_payload=$(cat /tmp/response_body.json)

    if [[ "$http_endpoint" == *"public/cam/api/v1"* ]]; then
        application_id=$(echo "$cloud_account_payload" | jq -r '.applicationId // empty')
    else
        application_id=$(echo "$cloud_account_payload" | jq -r '.applicationID // empty')
    fi

    if [ "$status_code" -eq 200 ]; then
        echo "[INFO] Status code is $status_code"
        echo "[INFO] Application ID is $application_id"
    fi

    management_group_details='{"displayName":"'${AZ_MANAGEMENT_GROUP_NAME}'","id":"'${AZ_MANAGEMENT_GROUP_ID}'","excludedSubscriptions":"'${AZ_EXCLUDED_SUBSCRIPTIONS}'"}'

    if [ "$status_code" -eq 200 ] && [ -n "$application_id" ]; then
        echo "[INFO] Common cloud account found, updating Azure account..."
        json_body='{
            "name": "'${CLOUD_ACCOUNT_NAME}'",
            "description": "'${CLOUD_ACCOUNT_DESCRIPTION}'",
            "features": '${AVAILABLE_FEATURE_REGIONS}',
            "applicationId": '${APP_REGISTRATION_ID}',
            "camDeployedRegion": "'${CAM_DEPLOYED_REGION}'",
            "managementGroup": '${management_group_details}',
            "isSharedApplication": '${IS_SHARED_APPLICATION}',
            "isCAMCloudASRMEnabled": '${IS_CAM_CLOUD_ASRM_ENABLED}',
            "featuresConfigFilePath": "'${CONFIG_BUCKET_URL}'"
        }'

        # Make HTTP request using cURL
        status_code=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
            -H "Authorization: Bearer $auth" \
            -H "Content-Type: application/json" \
            -H "x-user-role: Master Administrator" \
            -H "x-customer-id: $v1_account_id" \
            -H "x-task-id: $x_task_id" \
            -H "x-trace-id: $x_trace_id" \
            -d "$json_body" \
			-w "%{http_code}" \
            "$modify_account_url")

        # Check the status_code status
        if [[ "$status_code" == "204" ]]; then
            echo "[INFO] Calling cloud account API success status=$status_code"
        else
            echo "[INFO] Response status: $status_code"
            echo "[INFO] TraceID: $x_trace_id"
            print_error "[ERROR] Error: Could not call cloud account API. Please see the logs attached."
            exit 1
        fi

    elif [ "$status_code" -eq 404 ] || [ -z "$application_id" ]; then
        echo "[INFO] No common cloud account found, connecting Azure account..."
        json_body='{
            "tenantId": '${TENANT_ID}',
            "applicationId": '${APP_REGISTRATION_ID}',
            "subscriptionId": "'${SUBSCRIPTION_ID}'",
            "name": "'${CLOUD_ACCOUNT_NAME}'",
            "description": "'${CLOUD_ACCOUNT_DESCRIPTION}'",
            "connectedSecurityServices": '${CONNECTED_SECURITY_SERVICES_JSON}',
            "features": '${AVAILABLE_FEATURE_REGIONS}',
            "camDeployedRegion": "'${CAM_DEPLOYED_REGION}'",
            "managementGroup": '${management_group_details}',
            "isSharedApplication": '${IS_SHARED_APPLICATION}',
            "isCAMCloudASRMEnabled": '${IS_CAM_CLOUD_ASRM_ENABLED}',
            "featuresConfigFilePath": "'${CONFIG_BUCKET_URL}'"
        }'
        attempt=1
        delay=$BASE_DELAY
        while true; do
            # Implement exponential backoff with jitter for randomness
            delay=$((RANDOM % (delay * BACKOFF_FACTOR * 2) + delay))
            # Enforce a maximum delay to avoid excessive waiting
            delay=$((delay > 60 ? 60 : delay))
            sleep $delay
			echo "[INFO] Attempt $attempt: Connecting Azure account..."
            status_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
                -H "Authorization: Bearer $auth" \
                -H "Content-Type: application/json" \
                -H "x-user-role: Master Administrator" \
                -H "x-customer-id: $v1_account_id" \
                -H "x-task-id: $x_task_id" \
                -H "x-trace-id: $x_trace_id" \
                -d "$json_body" \
				-w "%{http_code}" \
                "$add_account_url")

            if [[ "$status_code" == "201" ]]; then
                echo "[INFO] Calling cloud account API success status=$status_code"
                break
            elif [[ $attempt -ge $MAX_RETRIES ]]; then
                echo "x_trace_id: $x_trace_id"
                print_error "[ERROR] Could not call cloud account API, unexpected status code: $status_code. Please see the logs attached."
                exit 1
            fi

            attempt=$((attempt + 1))
        done
    else
        print_error "[ERROR] Unexpected error when getting Azure account information..."
        exit 1
    fi
}

function grant_admin_consent_00000002_0000_0000_c000_000000000000 {
	clientId="$SERVICE_PRINCIPAL_OBJECT_ID"
    scope="Directory.Read.All User.Read User.Read.All"
    graph_object_id=$(az ad sp show --id 00000002-0000-0000-c000-000000000000 --query id --output tsv)

    echo "[INFO] Processing graph_id: $graph_object_id"

    app_role_assigned_resp=$(az rest --method POST \
        --uri "https://graph.microsoft.com/v1.0/servicePrincipals/$graph_object_id/appRoleAssignedTo" \
        --headers 'Content-Type=application/json' \
        --body '{
            "principalId": '"$clientId"',
            "resourceId": "'"$graph_object_id"'",
            "appRoleId": "5778995a-e1bf-45b8-affa-663a9f3f4d04"
        }' 2>&1)

    if echo "$app_role_assigned_resp" | grep -q "Permission being assigned already exists on the object"; then
        echo "[INFO] appRoleAssigned Permission already exists, continuing..."
    else
        echo "[INFO] appRoleAssigned Permission assigned to Role=5778995a-e1bf-45b8-affa-663a9f3f4d04 successfully"
    fi

    oauth_permission_resp=$(az rest --method POST \
        --uri "https://graph.microsoft.com/v1.0/oauth2PermissionGrants" \
        --headers 'Content-Type=application/json' \
        --body '{
            "clientId": '"$clientId"',
            "consentType": "AllPrincipals",
            "principalId": null,
            "resourceId": "'"$graph_object_id"'",
            "scope": "'"$scope"'"
        }' 2>&1)

    if echo "$oauth_permission_resp" | grep -q "Permission entry already exists"; then
        echo "[INFO] oauth2Permission Permission entry already exists, continuing..."
    else
        echo "[INFO] oauth2Permission Permission assigned to Scope=Directory.Read.All User.Read User.Read.All successfully"
    fi
}

function grant_admin_consent_00000003_0000_0000_c000_000000000000 {
	clientId="$SERVICE_PRINCIPAL_OBJECT_ID"
    scope="User.Read.All User.Read"
    graph_object_id=$(az ad sp show --id 00000003-0000-0000-c000-000000000000 --query id --output tsv)

    echo "[INFO] Processing graph_id: $graph_object_id"
    oauth_permission_resp=$(az rest --method POST \
        --uri "https://graph.microsoft.com/v1.0/oauth2PermissionGrants" \
        --headers 'Content-Type=application/json' \
        --body '{
            "clientId": '"$clientId"',
            "consentType": "AllPrincipals",
            "principalId": null,
            "resourceId": "'"$graph_object_id"'",
            "scope": "'"$scope"'"
        }' 2>&1)

    if echo "$oauth_permission_resp" | grep -q "Permission entry already exists"; then
        echo "[INFO] oauth2Permission Permission entry already exists, continuing..."
    else
        echo "[INFO] oauth2Permission Permission assigned to Scope=User.Read.All User.Read successfully"
    fi


    app_role_assigned_resp1=$(az rest --method POST \
        --uri "https://graph.microsoft.com/v1.0/servicePrincipals/$graph_object_id/appRoleAssignedTo" \
        --headers 'Content-Type=application/json' \
        --body '{
            "principalId": '"$clientId"',
            "resourceId": "'"$graph_object_id"'",
            "appRoleId": "7ab1d382-f21e-4acd-a863-ba3e13f7da61"
        }' 2>&1)

    if echo "$app_role_assigned_resp1" | grep -q "Permission being assigned already exists on the object"; then
        echo "[INFO] appRoleAssignedTo-7ab1d382 Permission entry already exists, continuing..."
    else
        echo "[INFO] appRoleAssignedTo-7ab1d382 Permission assigned to Role=7ab1d382-f21e-4acd-a863-ba3e13f7da61 successfully"
    fi

    app_role_assigned_resp2=$(az rest --method POST \
        --uri "https://graph.microsoft.com/v1.0/servicePrincipals/$graph_object_id/appRoleAssignedTo" \
        --headers 'Content-Type=application/json' \
        --body '{
            "principalId": '"$clientId"',
            "resourceId": "'"$graph_object_id"'",
            "appRoleId": "df021288-bdef-4463-88db-98f22de89214"
        }' 2>&1)
    if echo "$app_role_assigned_resp2" | grep -q "Permission being assigned already exists on the object"; then
        echo "[INFO] appRoleAssignedTo-df021288 Permission entry already exists, continuing..."
    else
        echo "[INFO] appRoleAssignedTo Permission assigned to Role=df021288-bdef-4463-88db-98f22de89214 successfully"
    fi
}

function cloud_account_activation() {
	vision_one_cloud_account_sync
    grant_admin_consent_00000002_0000_0000_c000_000000000000
    grant_admin_consent_00000003_0000_0000_c000_000000000000
}

function cloud_account_deletion() {
    echo "[INFO] Trigger cloud account deletion..."
    auth=$V1_API_KEY
    subscription_id=$SUBSCRIPTION_ID
    v1_account_id=$V1_ACCOUNT_ID
    http_endpoint=$ENDPOINT
    delete_account_url="$http_endpoint/azureSubscriptions/$subscription_id"
    x_task_id="$(uuidgen)"
    x_trace_id="$(uuidgen)"

    # Ensure required variables are not empty
    if [ -z "$auth" ] || [ -z "$subscription_id" ] || [ -z "$v1_account_id" ] || [ -z "$http_endpoint" ]; then
        print_error "[ERROR] One or more required environment variables are missing."
        return 1
    fi

    echo "[INFO] Deleting Azure account..."
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
        -H "Authorization: Bearer $auth" \
        -H "Content-Type: application/json" \
        -H "x-user-role: Master Administrator" \
        -H "x-customer-id: $v1_account_id" \
        -H "x-task-id: $x_task_id" \
        -H "x-trace-id: $x_trace_id" \
        "$delete_account_url")

    if [[ "$status_code" == "204" ]]; then
        echo "[INFO] The cloud account has been deleted status=$status_code"
    elif [[ "$status_code" == "404" ]]; then
        echo "[INFO] The cloud account not found, skip to delete, status=$status_code"
    else
        echo "[INFO] Response status: $status_code"
        echo "[INFO] TraceID: $x_trace_id"
        print_error "[ERROR] Error: Could not delete Azure cloud account."
        return 1
    fi

    return 0
}

function is_mgmt_group_deployed_account() {
    echo "[INFO] Checking if the cloud account is management group deployed..."
    expected_mgmt_group_id=$AZ_MANAGEMENT_GROUP_ID
    auth=$V1_API_KEY
    subscription_id=$SUBSCRIPTION_ID
    v1_account_id=$V1_ACCOUNT_ID
    http_endpoint=$ENDPOINT
    list_accounts_url="$http_endpoint/azureSubscriptions/$subscription_id"
    x_task_id="$(uuidgen)"
    x_trace_id="$(uuidgen)"

    # Ensure required variables are not empty
    if [ -z "$auth" ] || [ -z "$subscription_id" ] || [ -z "$v1_account_id" ] || [ -z "$http_endpoint" ] || [ -z "$expected_mgmt_group_id" ]; then
        print_error "[ERROR] One or more required environment variables are missing."
        exit 1
    fi

    echo "[INFO] Getting Azure account information..."
    temp_resp_file="/tmp/mgmt_response_body.json"
    response_body=$(curl -s -o "$temp_resp_file" -w "%{http_code}" -X GET "$list_accounts_url" \
        -H "Authorization: Bearer $auth" \
        -H "Content-Type: application/json" \
        -H "x-user-role: Master Administrator" \
        -H "x-customer-id: $v1_account_id" \
        -H "x-task-id: $x_task_id" \
        -H "x-trace-id: $x_trace_id")

    status_code="$response_body"
    cloud_account_payload=$(cat "$temp_resp_file")

    if [[ "$http_endpoint" == *"public/cam/api/v1"* ]]; then
        application_id=$(echo "$cloud_account_payload" | jq -r '.applicationId // empty')
    else
        application_id=$(echo "$cloud_account_payload" | jq -r '.applicationID // empty')
    fi
    target_mgmt_group_id=$(echo "$cloud_account_payload" | jq -r '.managementGroup.id // empty')

    if [ "$status_code" -eq 200 ] && [ -n "$target_mgmt_group_id" ]; then
        echo "[INFO] Status code is $status_code"
        echo "[INFO] Application ID is $application_id"
        echo "[INFO] The subscription is belong to the group [$target_mgmt_group_id]"
    elif [ "$status_code" -eq 404 ]; then
        echo "[INFO] The cloud account is not managed by Vision One CAM"
    else
        print_warn "[WARN] Status code is $status_code"
        print_warn "[WARN] Response body: $cloud_account_payload"
        print_warn "[WARN] Troubleshooting ID: $x_trace_id"
        print_warn "[WARN] Application ID is $application_id"
        print_warn "[WARN] Management group ID of the subscription is [$target_mgmt_group_id]"
    fi

    if [ -f "$temp_resp_file" ]; then
        rm -f "$temp_resp_file"
    fi

    if [ "$expected_mgmt_group_id" != "$target_mgmt_group_id" ]; then
        return 1
    fi
    return 0
}

function installation() {
    if ! clean_up_app_registration_and_service_principal "$SUBSCRIPTION_ID" \
        "$TF_STATE_STORAGE_ACCOUNT_NAME" "$RESOURCE_GROUP_NAME"; then
        print_error "[ERROR] Failed to clean up app registration and service principal"
        exit 1
    fi

    # move the legacy terraform state file to the module directory
    if [ -f "../terraform.tfstate" ]; then
        mv ../terraform.tfstate .
        echo "[INFO] Moving the legacy terraform state file to the new module directory"
    fi
    echo "[INFO] Deploying Vision One resources..."
    # pre-check
    check_required_env_vars

    # Create TF state bucket and check if the bucket already exists
    if ! create_terraform_state_bucket; then
        print_error "[ERROR] Failed to create the Blob Storage Bucket"
        exit 1
    fi

    # Upload the installed tools info to the state bucket
    if ! upload_deployment_info_to_state_bucket; then
        print_error "[ERROR] Failed to upload the deployment info to the state bucket"
        exit 1
    fi

    # Configure terraform backend
    if ! configure_terraform_backend; then
        print_error "[ERROR] Failed to configure terraform backend"
        exit 1
    fi

    if ! set_optional_params "$SHARED_APP_REGISTRATION_CLIENT_ID" "$SHARED_APP_REGISTRATION_OBJECT_ID" "$SHARED_SERVICE_PRINCIPAL_OBJECT_ID"; then
        print_error "[ERROR] Failed to set optional parameters"
        exit 1
    fi

    # Terraform init and apply
    if ! terraform_init_and_apply_cam_resources; then
        print_error "[ERROR] Failed to apply Vision One resources"
        exit 1
    fi

    echo "[INFO] Vision One resources have been successfully deployed. local storage usage: $(du -sh . | awk '{print $1}')"

    # Active the cloud account in Vision One
    if ! cloud_account_activation; then
        print_error "[ERROR] Failed to activate the cloud account in Vision One"
        exit 1
    fi
}

function uninstallation() {
    echo "[INFO] Destroying Vision One resources..."
    # pre-check
    check_required_env_vars

    if [ "$CHECK_IS_MGMT_GROUP_DEPLOYED" == "true" ]; then
        if ! is_mgmt_group_deployed_account; then
            echo "[INFO] The subscription is not deployed under the expected management group [$AZ_MANAGEMENT_GROUP_ID]."
            echo "[INFO] Skip to delete the resource."
            return 0
        fi
    fi

    if ! configure_terraform_backend; then
        print_error "[ERROR] Failed to configure terraform backend"
        exit 1
    fi

    if ! upload_deployment_info_to_state_bucket; then
        print_error "[ERROR] Failed to upload the deployment info to the state bucket"
        exit 1
    fi

    if ! set_optional_params "$SHARED_APP_REGISTRATION_CLIENT_ID" "$SHARED_APP_REGISTRATION_OBJECT_ID" "$SHARED_SERVICE_PRINCIPAL_OBJECT_ID"; then
        print_error "[ERROR] Failed to set optional parameters"
        exit 1
    fi

    if ! process_disabled_azure_features; then
        print_error "[ERROR] Failed to process disabled features"
        exit 1
    fi

    if ! terraform_destroy_cam_resources; then
        print_error "[ERROR] Failed to destroy Vision One resources"
        exit 1
    fi

    if ! backup_and_remove_legacy_tf_state; then
        print_error "[ERROR] Failed to backup and remove the legacy terraform state file"
        exit 1
    fi

    if ! handle_cam_output_blob delete; then
        print_error "[ERROR] Failed to delete the cam output file from Blob Storage"
        exit 1
    fi

    if [ -f "vision-one-cam-output.json" ]; then
        echo "[INFO] Cleaning up the output files..."
        rm -f "vision-one-cam-output.json"
    fi

    if [ "$IS_TO_DELETE_CLOUD_ACCOUNT" == "true" ]; then
        echo "[INFO] Deleting the cloud account in Vision One..."
        if ! cloud_account_deletion; then
            print_error "[ERROR] Failed to delete the cloud account in Vision One"
            exit 1
        fi
    fi
}

function get_subscription_id_suffix() {
    local subscription_id=$1
    local num_chars=$2
    if [ -z "$subscription_id" ]; then
        echo "[ERROR] subscription_id is empty"
        exit 1
    fi
    if [ -z "$num_chars" ]; then
        num_chars=6
    fi

    suffix=$(echo "$subscription_id" | tail -c $num_chars)
    echo "$suffix"
}

function precheck() {
    echo "[INFO] Pre-check Vision One resources and environment..."
    check_required_env_vars

    if ! configure_terraform_backend; then
        print_error "[ERROR] Failed to configure terraform backend"
        exit 1
    fi

    if ! process_disabled_azure_features; then
        print_error "[ERROR] Failed to process disabled features"
        exit 1
    fi

    if ! set_optional_params "$SHARED_APP_REGISTRATION_CLIENT_ID" "$SHARED_APP_REGISTRATION_OBJECT_ID" "$SHARED_SERVICE_PRINCIPAL_OBJECT_ID"; then
        print_error "[ERROR] Failed to set optional parameters"
        exit 1
    fi

    if ! terraform_init_and_plan; then
        print_error "[ERROR] Failed to plan Vision One resources"
        exit 1
    fi
}

function process_disabled_azure_features() {
    x_task_id="$(uuidgen)"
    x_trace_id="$(uuidgen)"
    v1_account_id=$V1_ACCOUNT_ID
    list_features_url="$ENDPOINT/azureSubscriptions/features"
    describe_subscription_url="$ENDPOINT/azureSubscriptions/$SUBSCRIPTION_ID"
    resp=$(curl -w "\n%{http_code}" -o /dev/stdout -X GET "$list_features_url" -H "Authorization: Bearer $V1_API_KEY" -H "Content-Type: application/json" -H "x-user-role: Master Administrator" -H "x-customer-id: $v1_account_id" -H "x-task-id: $x_task_id" -H "x-trace-id: $x_trace_id")

    status_code=$(echo "$resp" | tail -n1)
	response_body=$(echo "$resp" | sed '$d' | tr -d '\n')

    if [ "$status_code" -ne 200 ]; then
        echo "Error: Failed to fetch features from API with status code $status_code"
        return 1
    fi
	feature_ids=$(echo "$response_body" | jq -r ".items[].id")
	local disabled_features=""
	for feature in $feature_ids; do
		if [[ $FEATURES != *"$feature"* ]]; then
			echo "Feature $feature is disabled"
			disabled_features="$disabled_features $feature"
		fi
	done
	export DISABLED_FEATURES=$disabled_features

    describe_subscription_resp=$(curl -w "\n%{http_code}" -o /dev/stdout -X GET "$describe_subscription_url" -H "Authorization: Bearer $V1_API_KEY" -H "Content-Type: application/json" -H "x-user-role: Master Administrator" -H "x-customer-id: $v1_account_id" -H "x-task-id: $x_task_id" -H "x-trace-id: $x_trace_id")
	describe_status_code=$(echo "$describe_subscription_resp" | tail -n1)

    if [ "$describe_status_code" -ne 200 ]; then
        # Depending on the user's selection, keep the module and remove unnecessary feature modules from main.tf
        echo "Info: $v1_account_id is not connected to the subscription. Proceeding to establish connection ..."
        for feature in $disabled_features; do
            remove_feature_module_block "$feature"
        done
	else
        echo "Info: $v1_account_id is connected to the subscription. Proceeding to update subscription details ..."
		describe_response_body=$(echo "$describe_subscription_resp" | sed '$d' | tr -d '\n')
		describe_features_id=$(echo "$describe_response_body" | jq -r ".features[].id" | tr '\n' ' ')

        features_string=$(echo "$FEATURES" | jq -r '.[]' | tr '\n' ' ')
        echo "[DEBUG] features_string: $features_string"
        echo "[DEBUG] describe_features_id: $describe_features_id"
		merged_features=$(echo "$features_string $describe_features_id" | tr ' ' '\n' | sort -u | tr '\n' ' ')

		for feature in $feature_ids; do
			if [[ " $merged_features " != *" $feature "* ]]; then
				echo "Remove non-present '$feature' provider configuration"
				remove_feature_module_block "$feature"
			fi
		done
	fi
}

function backup_and_remove_legacy_tf_state() {
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        print_error "[Error] Azure CLI is not installed. Please install it before running this script."
        return 1
    fi

    # Backup the file by copying it to the same bucket with a assigned name
    echo "Backing up $TF_BACKUP_SOURCE_PATH to $TF_BACKUP_TARGETED_PATH ..."
    if ! az storage blob copy start \
        --destination-blob "$TF_BACKUP_FILE_NAME" \
        --destination-container "$TF_STATE_CONTAINER_NAME" \
        --source-blob "$TF_BACKUP_TARGETED_FILE_NAME" \
        --source-container "$TF_STATE_CONTAINER_NAME" \
        --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME"; then
        print_error "[ERROR] Failed to backup $TF_BACKUP_SOURCE_PATH."
        return 1
    fi

    echo "Backup successful."
    # Delete the original file to prevent the accidental use of the old state
    echo "Deleting the original file: $TF_BACKUP_SOURCE_PATH ..."
    if ! az storage blob delete \
        --container-name "$TF_STATE_CONTAINER_NAME" \
        --name "$TF_BACKUP_TARGETED_FILE_NAME" \
        --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME"; then
        print_error "[ERROR] Failed to delete $TF_BACKUP_SOURCE_PATH."
        return 1
    fi
    echo "[INFO] Legacy state file deleted successfully."
}

function store_optional_params(){
    if [ "$SHARED_APP_REGISTRATION_CLIENT_ID" == "" ] && \
       [ "$SHARED_APP_REGISTRATION_OBJECT_ID" == "" ] && \
       [ "$SHARED_SERVICE_PRINCIPAL_OBJECT_ID" == "" ]; then
        echo "[INFO] No optional parameters need to be stored."
        return 0
    fi

    local json_file="$CAM_OPTIONAL_PARAMS_FILE_NAME"
    local json_content
    json_content=$(jq -n \
        --arg shared_app_registration_client_id "$SHARED_APP_REGISTRATION_CLIENT_ID" \
        --arg shared_app_registration_object_id "$SHARED_APP_REGISTRATION_OBJECT_ID" \
        --arg shared_service_principal_object_id "$SHARED_SERVICE_PRINCIPAL_OBJECT_ID" \
        '{SHARED_APP_REGISTRATION_CLIENT_ID: $shared_app_registration_client_id, SHARED_APP_REGISTRATION_OBJECT_ID: $shared_app_registration_object_id, SHARED_SERVICE_PRINCIPAL_OBJECT_ID: $shared_service_principal_object_id}')

    echo "$json_content" > "$json_file"
    echo "[INFO] Optional parameters have been stored in $json_file"

    if ! az storage blob upload \
        --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
        --container-name "$TF_STATE_CONTAINER_NAME" \
        --name "${json_file}" \
        --file "${json_file}" --overwrite; then
        print_error "[ERROR] Failed to upload '${json_file}' to the blob storage"
        return 1
    else
        echo "[INFO] Uploaded '${json_file}' to the blob storage"
    fi
}

function remove_optional_params(){
    local json_file="$CAM_OPTIONAL_PARAMS_FILE_NAME"
    if [ -f "$json_file" ]; then
        rm -f "$json_file"
        echo "[INFO] Optional parameters file has been removed."
    fi

    if [ "$(az storage blob exists --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
        --container-name "$TF_STATE_CONTAINER_NAME" \
        --name "$json_file" --query "exists" --output tsv)" == "true" ]; then

        if ! az storage blob delete --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
            --container-name "$TF_STATE_CONTAINER_NAME" --name "$json_file"; then
            print_error "[ERROR] Failed to remove the optional parameters file from the state bucket."
            return 1
        fi
        echo "[INFO] Optional parameters file has been removed from the state bucket."
    fi
}

function set_optional_params() {
    # incoming optional parameters
    incoming_shared_app_registration_client_id=$1
    incoming_shared_app_registration_object_id=$2
    incoming_shared_service_principal_object_id=$3

    local json_file="$CAM_OPTIONAL_PARAMS_FILE_NAME"
    if [ "$(az storage blob exists --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
            --container-name "$TF_STATE_CONTAINER_NAME" \
            --name "$json_file" --query "exists" --output tsv)" != "true" ]; then
        echo "[INFO] Optional parameters file not exist in the state bucket, the optional parameters will set as user input or default."
        return 0
    fi

    if [ ! -f "$json_file" ]; then
        echo "[INFO] Optional parameters file not exist in the local directory, download the file from the state bucket..."
        if ! az storage blob download --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" --container-name "$TF_STATE_CONTAINER_NAME" --name "$json_file" --file "$json_file"; then
            echo "[ERROR] Failed to download $json_file from the state bucket"
            return 1
        fi
    fi

    echo "[INFO] The optional parameters file exist, adopt the values..."
    local shared_app_registration_client_id
    local shared_app_registration_object_id
    local shared_service_principal_object_id
    shared_app_registration_client_id=$(jq -r '.SHARED_APP_REGISTRATION_CLIENT_ID' "$json_file")
    shared_app_registration_object_id=$(jq -r '.SHARED_APP_REGISTRATION_OBJECT_ID' "$json_file")
    shared_service_principal_object_id=$(jq -r '.SHARED_SERVICE_PRINCIPAL_OBJECT_ID' "$json_file")

    if [ "$incoming_shared_app_registration_client_id" != "$shared_app_registration_client_id" ] && [ "$shared_app_registration_client_id" != "" ] && [ "$incoming_shared_app_registration_client_id" != "" ]; then
        echo "[INFO] The incoming shared app registration client id is different from the stored value, update the value..."
        SHARED_APP_REGISTRATION_CLIENT_ID=$incoming_shared_app_registration_client_id
    else
        SHARED_APP_REGISTRATION_CLIENT_ID=$shared_app_registration_client_id
    fi

    if [ "$incoming_shared_app_registration_object_id" != "$shared_app_registration_object_id" ] && [ "$shared_app_registration_object_id" != "" ] && [ "$incoming_shared_app_registration_object_id" != "" ]; then
        echo "[INFO] The incoming shared app registration object id is different from the stored value, update the value..."
        SHARED_APP_REGISTRATION_OBJECT_ID=$incoming_shared_app_registration_object_id
    else
        SHARED_APP_REGISTRATION_OBJECT_ID=$shared_app_registration_object_id
    fi

    if [ "$incoming_shared_service_principal_object_id" != "$shared_service_principal_object_id" ] && [ "$shared_service_principal_object_id" != "" ] && [ "$incoming_shared_service_principal_object_id" != "" ]; then
        echo "[INFO] The incoming shared service principal object id is different from the stored value, update the value..."
        SHARED_SERVICE_PRINCIPAL_OBJECT_ID=$incoming_shared_service_principal_object_id
    else
        SHARED_SERVICE_PRINCIPAL_OBJECT_ID=$shared_service_principal_object_id
    fi

    echo "[INFO] Set shared app registration client id to [$SHARED_APP_REGISTRATION_CLIENT_ID]"
    echo "[INFO] Set shared app registration object id to [$SHARED_APP_REGISTRATION_OBJECT_ID]"
    echo "[INFO] Set shared service principal object id to [$SHARED_SERVICE_PRINCIPAL_OBJECT_ID]"
    return 0
}

function handle_cam_output_blob() {
    local action=$1  # "upload", "download", or "delete"
    local blob_name="vision-one-cam-output.json"

    if [ -z "$TF_STATE_STORAGE_ACCOUNT_NAME" ] || [ -z "$TF_STATE_CONTAINER_NAME" ]; then
        print_error "[ERROR] Missing TF_STATE_STORAGE_ACCOUNT_NAME or TF_STATE_CONTAINER_NAME"
        return 1
    fi

    case "$action" in
        upload)
            if [ -f "$blob_name" ]; then
                echo "[INFO] Uploading $blob_name to Blob Storage..."
                if ! az storage blob upload \
                    --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
                    --container-name "$TF_STATE_CONTAINER_NAME" \
                    --name "$blob_name" \
                    --file "$blob_name" \
                    --overwrite; then
                    print_error "[ERROR] Failed to upload $blob_name to Blob Storage"
                    return 1
                fi
                echo "[INFO] Upload complete"
            fi
            ;;
        download)
            if [ ! -f "$blob_name" ]; then
                echo "[INFO] $blob_name not found locally, attempting download from Blob Storage..."
                if ! az storage blob download \
                    --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
                    --container-name "$TF_STATE_CONTAINER_NAME" \
                    --name "$blob_name" \
                    --file "$blob_name" \
                    --output none; then
                    print_warn "[WARN] Failed to download $blob_name from Blob Storage"
                else
                    echo "[INFO] Downloaded $blob_name from Blob Storage"
                fi
            fi
            ;;
        delete)
            echo "[INFO] Checking if $blob_name exists in Blob Storage..."
            if [ "$(az storage blob exists \
                --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
                --container-name "$TF_STATE_CONTAINER_NAME" \
                --name "$blob_name" \
                --query "exists" --output tsv)" == "true" ]; then

                echo "[INFO] Deleting $blob_name from Blob Storage..."
                if ! az storage blob delete \
                    --account-name "$TF_STATE_STORAGE_ACCOUNT_NAME" \
                    --container-name "$TF_STATE_CONTAINER_NAME" \
                    --name "$blob_name"; then
                    print_warn "[WARN] Failed to delete $blob_name from Blob Storage"
                    return 1
                fi
                echo "[INFO] $blob_name deleted successfully"
            fi
            ;;
        *)
            print_error "[ERROR] Unknown action: $action"
            return 1
            ;;
    esac
}
