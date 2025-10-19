variable "resource_group_name" {
  type = string
}

variable "resource_group_location" {
  type = string
}

variable "event_grid_name" {
  type = string
}

variable "event_grid_topic_list" {
  description = "List of Event Grid topic names."
  type        = list(string)
}

variable "user_assigned_identity_id" {
  type = string
}

variable "module_name" {
  type = string
}

variable "env_type" {
  type = string
}
