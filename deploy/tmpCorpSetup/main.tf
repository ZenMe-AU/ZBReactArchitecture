#This script generates the users, groups and configuration required to allow automated least privileged deployments of environments.

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.1.0"
}
provider "azurerm" {
  features {}
  subscription_id = "0930d9a7-2369-4a2d-a0b6-5805ef505868"
}

data "azurerm_billing_mca_account_scope" "azurebilling" {
  billing_account_name = "edfff974-6731-50ea-0fa2-408ef0b836c6:2a8112ce-43a8-4c25-ba3e-6fc620c0df69_2019-05-31"
  billing_profile_name = "VTIP-4TUY-BG7-PGB"
  invoice_section_name = "LKYD-S7LG-PJA-PGB"
}

#Create a new subscription
resource "azurerm_subscription" "payg" {
    subscription_name = "Pay-As-You-Go Subscription"
    billing_scope_id  = data.azurerm_billing_mca_account_scope.azurebilling.id
}

# Add a $100 monthly limit to the subscription
resource "azurerm_consumption_budget_subscription" "payg_budget" {
    name             = "monthly-budget"
    amount           = 100
    subscription_id  = azurerm_subscription.payg.id

    time_period {
        start_date = "2025-01-01T00:00:00Z"
    }

    notification {
        enabled        = true
        threshold      = 100
        operator       = "EqualTo"
        contact_emails = ["jake.vosloo@outlook.com"]
    }
}



# Create ResourceGroupDeployer Entra security group 
resource "azuread_group" "resource_group_deployer" {
    display_name     = "ResourceGroupDeployer"
    security_enabled = true
}

# Assign the resourcegroup deployer as owner of the subscription
resource "azurerm_role_assignment" "resource_group_deployer_owner" {
    scope                = azurerm_subscription.payg.id
    role_definition_name = "Owner"
    principal_id         = azuread_group.resource_group_deployer.object_id
}

data "azuread_group" "lead_developer" {
    display_name = "LeadDeveloper"
}

# Add LeadDeveloper security group as member of ResourceGroupDeployer
resource "azuread_group_member" "lead_developer_member" {
    group_object_id  = azuread_group.resource_group_deployer.id
    member_object_id = data.azuread_group.lead_developer.object_id
}

# Create DB Admin security groups namely DbAdmin-Dev, DbAdmin-Test, DbAdmin-Prod, ensure it allows Microsoft Entra roles to be assigned to the group
resource "azuread_group" "db_admin_dev" {
    display_name     = "DbAdmin-Dev"
    security_enabled = true
}
resource "azuread_group" "db_admin_test" {
    display_name     = "DbAdmin-Test"
    security_enabled = true
}
resource "azuread_group" "db_admin_prod" {
    display_name     = "DbAdmin-Prod"
    security_enabled = true
}

# Add the resourcegroupdeployer to the DB Admin groups
resource "azuread_group_member" "db_admin_dev_member" {
    group_object_id  = azuread_group.db_admin_dev.id
    member_object_id = azuread_group.resource_group_deployer.object_id
}
resource "azuread_group_member" "db_admin_test_member" {
    group_object_id  = azuread_group.db_admin_test.id
    member_object_id = azuread_group.resource_group_deployer.object_id
}
resource "azuread_group_member" "db_admin_prod_member" {
    group_object_id  = azuread_group.db_admin_prod.id
    member_object_id = azuread_group.resource_group_deployer.object_id
}


# Add "App Configuration Data Owner" role as an eligible assignment to the current user with 1 year duration
resource "azuread_role_eligibility_schedule" "current_user_app_config_owner" {
    role_definition_id = azuread_directory_role.app_configuration_data_owner.id
    principal_id      = azuread_user.current_user.id
    start_date        = "2023-10-01T00:00:00Z"
    end_date          = "2024-10-01T00:00:00Z"
}

# For every member of the LeadDevelopers group, add "App Configuration Data Owner" role as an eligible assignment with 1 year duration
resource "azuread_role_eligibility_schedule" "lead_developer_app_config_owner" {
    for_each           = toset(azuread_group.lead_developer.members)
    role_definition_id = azuread_directory_role.app_configuration_data_owner.id
    principal_id       = each.value
    start_date         = "2023-10-01T00:00:00Z"
    end_date           = "2024-10-01T00:00:00Z"
}


