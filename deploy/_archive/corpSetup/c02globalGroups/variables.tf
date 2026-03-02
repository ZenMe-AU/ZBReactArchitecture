
# Define variables for the environment deployment

# The target environment will automatically load from the environment variable TF_VAR_target_env
variable "subscription_id" {
  description = "The ID of the Azure Subscription"
  type        = string
}