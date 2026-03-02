
# Define variables for the environment deployment
variable "billing_account_name" {
  description = "The name of the Azure Billing Account"
  type        = string
  default     = "edfff974-6731-50ea-0fa2-408ef0b836c6:259cc357-9fd2-4fba-a7b0-a77f81050f02_2019-05-31"
}
variable "billing_profile_name" {
  description = "The name of the Azure Billing Profile"
  type        = string
  default     = "XVDH-IO2E-BG7-PGB"
}
variable "invoice_section_name" {
  description = "The name of the new Azure Invoice Section to be created"
  type        = string
  default     = "239e368b-1156-4a0e-95f5-6d8952ae8bac"
}
variable "subscription_name" {
  description = "The name of the Azure Subscription"
  type        = string
}
variable "subscription_id" {
  description = "The ID of the Azure Subscription"
  type        = string
}
variable "contact_emails" {
  description = "List of contact emails for budget notification"
  type        = list(string)
  default     = ["jake.vosloo@outlook.com", "LukeYeh@zenme.com.au"]
}