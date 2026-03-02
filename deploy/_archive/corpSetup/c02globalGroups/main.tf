#This script generates the users, groups and configuration required to allow automated least privileged deployments of environments.

# Create ResourceGroupDeployer Entra security group
resource "azuread_group" "resource_group_deployer" {
    display_name     = "ResourceGroupDeployer"
    security_enabled = true
}

# Assign the resourcegroup deployer as owner of the subscription
resource "azurerm_role_assignment" "resource_group_deployer_owner" {
    scope                = "/subscriptions/${var.subscription_id}"
    role_definition_name = "Owner"
    principal_id         = azuread_group.resource_group_deployer.object_id
}

resource "azuread_group" "lead_developer" {
    display_name       = "LeadDeveloper"
    security_enabled   = true
    assignable_to_role = true
}

# Add LeadDeveloper security group as member of ResourceGroupDeployer
resource "azuread_group_member" "lead_developer_member" {
    group_object_id  = azuread_group.resource_group_deployer.object_id
    member_object_id = azuread_group.lead_developer.object_id
}

# Create DB Admin security groups namely DbAdmin-Dev, DbAdmin-Test, DbAdmin-Prod, ensure it allows Microsoft Entra roles to be assigned to the group
resource "azuread_group" "db_admin_dev" {
    display_name     = "DbAdmin-Dev"
    security_enabled = true
    description      = "DB admins for Dev environments"
}
resource "azuread_group" "db_admin_test" {
    display_name     = "DbAdmin-Test"
    security_enabled = true
    description      = "DB admins for Test environments"
}
resource "azuread_group" "db_admin_prod" {
    display_name     = "DbAdmin-Prod"
    security_enabled = true
    description      = "DB admins for Prod environments"
}

# Add the resourcegroupdeployer to the DB Admin groups
resource "azuread_group_member" "db_admin_dev_member" {
    group_object_id  = azuread_group.db_admin_dev.object_id
    member_object_id = azuread_group.resource_group_deployer.object_id
}
resource "azuread_group_member" "db_admin_test_member" {
    group_object_id  = azuread_group.db_admin_test.object_id
    member_object_id = azuread_group.resource_group_deployer.object_id
}
resource "azuread_group_member" "db_admin_prod_member" {
    group_object_id  = azuread_group.db_admin_prod.object_id
    member_object_id = azuread_group.resource_group_deployer.object_id
}


# # Add "App Configuration Data Owner" role as an eligible assignment to the current user with 1 year duration
# resource "azuread_role_eligibility_schedule" "current_user_app_config_owner" {
#     role_definition_id = azuread_directory_role.app_configuration_data_owner.id
#     principal_id      = azuread_user.current_user.id
#     start_date        = "2025-10-01T00:00:00Z"
#     end_date          = "2026-10-01T00:00:00Z"
# }

# # For every member of the LeadDevelopers group, add "App Configuration Data Owner" role as an eligible assignment with 1 year duration
# resource "azuread_role_eligibility_schedule" "lead_developer_app_config_owner" {
#     for_each           = toset(azuread_group.lead_developer.members)
#     role_definition_id = azuread_directory_role.app_configuration_data_owner.id
#     principal_id       = each.value
#     start_date         = "2025-10-01T00:00:00Z"
#     end_date           = "2026-10-01T00:00:00Z"
# }

