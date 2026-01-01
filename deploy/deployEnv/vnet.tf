
variable "vnet_name" {
  description = "Name of the Azure Virtual Network"
  type        = string
}
variable "acr_name" {
  description = "Name of the Azure Container Registry"
  type        = string
}
variable "runner_name" {
  description = "Name of the GitHub Self-Hosted Runner"
  type        = string
}
variable "db_admin_uai_name" {
  description = "Name of the User Assigned Identity for DB Admin"
  type        = string
}
# variable "github_pat" {
#   description = "GitHub Personal Access Token"
#   type        = string
# }

resource "azurerm_virtual_network" "vnet" {
  name                = var.vnet_name
  address_space       = ["10.0.0.0/16"]
  location            =  data.azurerm_resource_group.rg.location
  resource_group_name =  data.azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "aca_subnet" {
  name                 = "aca-subnet"
  resource_group_name  = data.azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]

  delegation {
    name = "aca-delegation"
    service_delegation {
      name    = "Microsoft.App/environments"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}

# # platform layer
# resource "azurerm_resource_group" "aca_infra" {
#   name     = "ME_aca-env-vnet_${data.azurerm_resource_group.rg.name}_${data.azurerm_resource_group.rg.location}"
#   location =  data.azurerm_resource_group.rg.location

#   lifecycle {
#     prevent_destroy = true
#   }
# }
#  Container Apps Environment (binding subnet)
resource "azurerm_container_app_environment" "env" {
  name                = "aca-env-vnet"
  location            =  data.azurerm_resource_group.rg.location
  resource_group_name =  data.azurerm_resource_group.rg.name
  infrastructure_subnet_id = azurerm_subnet.aca_subnet.id
  infrastructure_resource_group_name = "ME_aca-env-vnet_${data.azurerm_resource_group.rg.name}_${data.azurerm_resource_group.rg.location}"
  logs_destination="log-analytics"
  log_analytics_workspace_id = azurerm_log_analytics_workspace.loganalytics_workspace.id#TODO:move to log?
  workload_profile {
    name = "Consumption"
    workload_profile_type = "Consumption"
  }
}

#  Azure Container Registry
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# resource "azurerm_container_registry_task" "runner_build" {
#   name                 = "build-runner-task"
#   container_registry_id = azurerm_container_registry.acr.id

#   platform {
#     os       = "Linux"
#     # architecture = "amd64"
#   }

#   docker_step {
#     dockerfile_path      = "Dockerfile"
#     context_path         = "https://github.com/<username>/<repository>#<branch>:<folder>"
#     context_access_token = "<github personal access token>"
#     image_names          = ["my-runner:latest"]
#   }

#   source_trigger {
#     name = "github-main"
#     events = ["commit"]
#     repository_url = "https://github.com/<org>/<repo>"
#     source_type = "Github"
#   }
# }

# User Assigned Identity
resource "azurerm_user_assigned_identity" "uai_db_admin" {
  name                = var.db_admin_uai_name
  resource_group_name = data.azurerm_resource_group.rg.name
  location            = data.azurerm_resource_group.rg.location
}
# Set uai Administrator for PostgreSQL
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "pg_admin_uai" {
  resource_group_name = data.azurerm_resource_group.rg.name
  server_name         = azurerm_postgresql_flexible_server.pg_server.name
  object_id           = azurerm_user_assigned_identity.uai_db_admin.principal_id
  tenant_id           = data.azurerm_client_config.current.tenant_id
  principal_name      = azurerm_user_assigned_identity.uai_db_admin.name
  principal_type      = "ServicePrincipal"
}

resource "azurerm_container_app_job" "runner" {
  name                         = var.runner_name
  resource_group_name          = data.azurerm_resource_group.rg.name
  location                     = data.azurerm_resource_group.rg.location
  container_app_environment_id = azurerm_container_app_environment.env.id
  replica_timeout_in_seconds   = 600
  workload_profile_name        = "Consumption"

  identity {
    type = "SystemAssigned"
  }
  # event_trigger_config {
  #   # parallelism = 1
  # }
  manual_trigger_config {
    # parallelism = 1
    # replica_completion_count = 1
  }
  registry {
    identity = "system"
    server   = azurerm_container_registry.acr.login_server
  }
  # secret {
  #   name  = "runner-token"
  #   value = var.github_pat
  # }
  template {
    container {
      name  = "github-self-hosted-runner"
      image = "${azurerm_container_registry.acr.login_server}/github-runner:latest"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "RUNNER_TOKEN"
        # secret_name = "runner-token"
      }
      # env {
      #   name  = "GITHUB_ORG"
      #   value = "ZenMe-AU"
      # }
      env {
        name  = "GITHUB_REPO"
        # value = "ZBReactArchitecture"
      }
    }
  }
}
resource "azurerm_role_assignment" "runner_contributor" {
  scope                = data.azurerm_resource_group.rg.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_container_app_job.runner.identity[0].principal_id
}
resource "azurerm_role_assignment" "runner_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_container_app_job.runner.identity[0].principal_id
}
resource "azurerm_role_assignment" "runner_can_use_db_admin" {
  scope                = azurerm_user_assigned_identity.uai_db_admin.id
  role_definition_name = "Managed Identity Operator"
  principal_id         = azurerm_container_app_job.runner.identity[0].principal_id
}



# resource "azurerm_container_app" "job" {
#   name                         = "aca-job-runner"
#   container_app_environment_id  = azurerm_container_app_environment.env.id
#   resource_group_name           = azurerm_resource_group.rg.name
#   location                      = azurerm_resource_group.rg.location

#   identity {
#     type         = "UserAssigned"
#     identity_ids = [azurerm_user_assigned_identity.uai.id]
#   }

#   container {
#     name  = "runner"
#     image = "${azurerm_container_registry.acr.login_server}/my-runner:latest"

#     registry_server   = azurerm_container_registry.acr.login_server
#     registry_username = azurerm_container_registry.acr.admin_username
#     registry_password = azurerm_container_registry.acr.admin_password

#     cpu    = 0.5
#     memory = "1Gi"

#     env {
#       name  = "RUNNER_TOKEN"
#       value = "<GitHub PAT token>"  # 建議改成 Container Apps Secret
#     }

#     env {
#       name  = "POSTGRES_HOST"
#       value = azurerm_postgresql_flexible_server.pg.fqdn
#     }
#   }
# }








# resource "azurerm_subnet" "pg_pe_subnet" {
#   name                 = "pg-pe-subnet"
#   resource_group_name  = data.azurerm_resource_group.rg.name
#   virtual_network_name = azurerm_virtual_network.vnet.name
#   address_prefixes     = ["10.0.2.0/24"]
# }

# resource "azurerm_private_dns_zone" "pg" {
#   name                = "privatelink.postgres.database.azure.com"
#   resource_group_name = data.azurerm_resource_group.rg.name
# }

# resource "azurerm_private_dns_zone_virtual_network_link" "pg" {
#   name                  = "pg-dns-link"
#   resource_group_name   = data.azurerm_resource_group.rg.name
#   private_dns_zone_name = azurerm_private_dns_zone.pg.name
#   virtual_network_id    = azurerm_virtual_network.vnet.id
# }

# resource "azurerm_private_endpoint" "pg" {
#   name                = "pg-private-endpoint"
#   location            = data.azurerm_resource_group.rg.location
#   resource_group_name = data.azurerm_resource_group.rg.name
#   subnet_id           = azurerm_subnet.pg_pe_subnet.id

#   private_service_connection {
#     name                           = "pg-connection"
#     private_connection_resource_id = azurerm_postgresql_flexible_server.pg_server.id
#     subresource_names              = ["postgresqlServer"]
#     is_manual_connection           = false
#   }
# }