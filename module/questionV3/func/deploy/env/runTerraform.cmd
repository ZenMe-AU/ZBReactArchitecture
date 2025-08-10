set TF_VAR_target_env="coherentladybug"
set TF_VAR_module_name="questionV3"

terraform init -backend-config "resource_group_name=zenmefunctionapp1"  -backend-config "storage_account_name=zenmefunctionapp1" -backend-config "container_name=tfstatefile" -backend-config "key=dev/shared/terraform.tfstate"
     