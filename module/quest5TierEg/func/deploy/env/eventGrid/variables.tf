variable "resource_group_name" {
  type = string
}

variable "resource_group_location" {
  type = string
}

variable "event_grid_name" {
  type = string
}

# variable "event_grid_topic_list" {
#   type = list(object({
#     name          = string
#     subscription  = string
#     webhook_url   = string
#   }))
# }

variable "env_type" {
  type = string
}
