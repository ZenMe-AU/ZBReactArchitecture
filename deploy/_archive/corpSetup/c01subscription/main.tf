#This script generates the new subscription required to host the corporate resources.

#Create a new subscription
resource "azurerm_subscription" "payg" {
    subscription_name = var.subscription_name
    billing_scope_id  = data.azurerm_billing_mca_account_scope.azure_billing.id
}
output "new_subscription_id" {
  value = azurerm_subscription.payg.subscription_id
}

# Add a $100 monthly limit to the subscription
resource "azurerm_consumption_budget_subscription" "payg_budget" {
    name             = "monthly-budget"
    amount           = 100
    subscription_id  = "/subscriptions/${azurerm_subscription.payg.subscription_id}"

    time_period {
        start_date = "2025-12-01T00:00:00Z"
    }

    notification {
        enabled        = true
        threshold      = 100
        operator       = "EqualTo"
        contact_emails = var.contact_emails
    }
}
