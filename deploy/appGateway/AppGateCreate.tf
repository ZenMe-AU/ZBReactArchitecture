terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 4.0"
    }
  }
  required_version = ">= 1.4.0"
}

# Provider configuration
provider "azurerm" {
  features {}
  subscription_id = "0930d9a7-2369-4a2d-a0b6-5805ef505868"
}

data "azurerm_client_config" "current" {}

# Variables
variable "environment_prefix" {
  description = "Environment prefix for resource naming"
  type        = string
  default     = "chemicalfirefly"
}

variable "root_prefix" {
  description = "Root prefix for resource group and base resources"
  type        = string
  default     = "root-zenblox"
}

variable "domain_name" {
  description = "Domain name for resources"
  type        = string
  default     = "zenblox"
}

# Data sources for existing resources
data "azurerm_resource_group" "root" {
  name = var.root_prefix
}

resource "azurerm_virtual_network" "main" {
  name                = "${var.root_prefix}-vnetc"
  resource_group_name = data.azurerm_resource_group.root.name
  location            = "australiaeast"
  address_space       = ["10.1.0.0/16"]
}

resource "azurerm_subnet" "appgateway" {
  name                 = "subnet-appgatewayc"
  resource_group_name  = data.azurerm_resource_group.root.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.1.0.0/24"]
  
  private_endpoint_network_policies             = "Disabled"
  private_link_service_network_policies_enabled = true
}

resource "azurerm_public_ip" "appgateway" {
  name                = "${var.root_prefix}-publicipc"
  resource_group_name = data.azurerm_resource_group.root.name
  location            = "australiaeast"
  zones               = ["1", "2", "3"]
  
  sku                     = "Standard"
  allocation_method       = "Static"
  ip_version              = "IPv4"
  idle_timeout_in_minutes = 4
  
  domain_name_label = "${var.root_prefix}-appgatewayc"
  
  ddos_protection_mode = "VirtualNetworkInherited"
}

resource "azurerm_user_assigned_identity" "appgateway" {
  name                = "${var.domain_name}-appgw-uamic"
  resource_group_name = data.azurerm_resource_group.root.name
  location            = "australiaeast"
  
  tags = {}
}

# User-assigned identity for ACME automation (DNS updates + Key Vault import)
resource "azurerm_user_assigned_identity" "acme" {
  name                = "acme-kvt-uami"
  resource_group_name = data.azurerm_resource_group.root.name
  location            = "australiaeast"

  tags = {}
}

# Look up Key Vaults referenced by ssl_certificate key_vault_secret_id
data "azurerm_key_vault" "kvt" {
  name                = "kvt-${var.domain_name}"
  resource_group_name = data.azurerm_resource_group.root.name
}

data "azurerm_key_vault" "kv" {
  name                = "kv-${var.domain_name}"
  resource_group_name = data.azurerm_resource_group.root.name
}

# Grant the Application Gateway identity access to get/list secrets
resource "azurerm_key_vault_access_policy" "appgw_kvt_policy" {
  key_vault_id = data.azurerm_key_vault.kvt.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.appgateway.principal_id

  secret_permissions = [
    "Get",
    "List",
  ]
}

resource "azurerm_key_vault_access_policy" "appgw_kv_policy" {
  key_vault_id = data.azurerm_key_vault.kv.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.appgateway.principal_id

  secret_permissions = [
    "Get",
    "List",
  ]
}

# Key Vault access policy for the ACME managed identity
resource "azurerm_key_vault_access_policy" "acme_kvt_policy" {
  key_vault_id = data.azurerm_key_vault.kvt.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.acme.principal_id

  certificate_permissions = [
    "Create",
    "Import",
    "Get",
    "List",
  ]

  secret_permissions = [
    "Get",
    "List",
    "Set",
  ]
}

# Role assignment granting DNS Zone Contributor on the DNS zone to the ACME identity
resource "azurerm_role_assignment" "acme_dns_zone" {
  scope                = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${data.azurerm_resource_group.root.name}/providers/Microsoft.Network/dnszones/${var.domain_name}.com.au"
  role_definition_name = "DNS Zone Contributor"
  principal_id         = azurerm_user_assigned_identity.acme.principal_id
}

# Application Gateway
resource "azurerm_application_gateway" "main" {
  name                = "${var.root_prefix}-appgatewayc"
  resource_group_name = data.azurerm_resource_group.root.name
  location            = "australiaeast"
  zones               = ["1", "2", "3"]

  sku {
    name     = "Basic"
    tier     = "Basic"
    capacity = 2
  }

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.appgateway.id]
  }

  gateway_ip_configuration {
    name      = "appGatewayIpConfigC"
    subnet_id = azurerm_subnet.appgateway.id
  }

  # Frontend IP Configuration
  frontend_ip_configuration {
    name                 = "appGwPublicFrontendIpIPv4"
    public_ip_address_id = azurerm_public_ip.appgateway.id
  }

  # Frontend Ports
  frontend_port {
    name = "port_80"
    port = 80
  }

  frontend_port {
    name = "port_443"
    port = 443
  }

  # SSL Certificates
  # ssl_certificate {
  #   name                = "quest3tier-ssl"
  #   key_vault_secret_id = "https://kv-${var.domain_name}.vault.azure.net/secrets/quest3tier-cert"
  # }
  # NOTE: quest3tier KeyVault-backed ssl_certificate temporarily removed
  # to allow Application Gateway provisioning while Key Vault/network
  # access issues are resolved. Re-add when KV access is confirmed.

  ssl_certificate {
    name                = "profileCert"
    key_vault_secret_id = "https://kvt-${var.domain_name}.vault.azure.net/secrets/profileCert"
  }

  # Backend Address Pools
  backend_address_pool {
    name  = local.apiOne_backend_pool.name
    fqdns = local.apiOne_backend_pool.fqdns
  }

  backend_address_pool {
    name  = local.apiTwo_backend_pool.name
    fqdns = local.apiTwo_backend_pool.fqdns
  }

  # Backend HTTP Settings
  backend_http_settings {
    name                                = local.apiOne_http_settings.name
    cookie_based_affinity               = local.apiOne_http_settings.cookie_based_affinity
    port                                = local.apiOne_http_settings.port
    protocol                            = local.apiOne_http_settings.protocol
    request_timeout                     = local.apiOne_http_settings.request_timeout
    pick_host_name_from_backend_address = local.apiOne_http_settings.pick_host_name_from_backend_address
  }

  backend_http_settings {
    name                                = local.apiTwo_http_settings.name
    cookie_based_affinity               = local.apiTwo_http_settings.cookie_based_affinity
    port                                = local.apiTwo_http_settings.port
    protocol                            = local.apiTwo_http_settings.protocol
    request_timeout                     = local.apiTwo_http_settings.request_timeout
    pick_host_name_from_backend_address = local.apiTwo_http_settings.pick_host_name_from_backend_address
  }

  # HTTP Listeners
  http_listener {
    name                           = local.apiTwo_listener.name
    frontend_ip_configuration_name = local.apiTwo_listener.frontend_ip_configuration_name
    frontend_port_name             = local.apiTwo_listener.frontend_port_name
    protocol                       = local.apiTwo_listener.protocol
    ssl_certificate_name           = local.apiTwo_listener.ssl_certificate_name
    host_name                      = local.apiTwo_listener.host_name
    require_sni                    = local.apiTwo_listener.require_sni
  }

  http_listener {
    name                           = local.apiOne_listener.name
    frontend_ip_configuration_name = local.apiOne_listener.frontend_ip_configuration_name
    frontend_port_name             = local.apiOne_listener.frontend_port_name
    protocol                       = local.apiOne_listener.protocol
    ssl_certificate_name           = local.apiOne_listener.ssl_certificate_name
    host_name                      = local.apiOne_listener.host_name
    require_sni                    = local.apiOne_listener.require_sni
  }

  # Request Routing Rules
  request_routing_rule {
    name                       = local.apiOne_routing_rule.name
    rule_type                  = local.apiOne_routing_rule.rule_type
    priority                   = local.apiOne_routing_rule.priority
    http_listener_name         = local.apiOne_routing_rule.http_listener_name
    backend_address_pool_name  = local.apiOne_routing_rule.backend_address_pool_name
    backend_http_settings_name = local.apiOne_routing_rule.backend_http_settings_name
  }

  request_routing_rule {
    name                       = local.apiTwo_routing_rule.name
    rule_type                  = local.apiTwo_routing_rule.rule_type
    priority                   = local.apiTwo_routing_rule.priority
    http_listener_name         = local.apiTwo_routing_rule.http_listener_name
    backend_address_pool_name  = local.apiTwo_routing_rule.backend_address_pool_name
    backend_http_settings_name = local.apiTwo_routing_rule.backend_http_settings_name
  }

  enable_http2 = true
  fips_enabled = false

  ssl_policy {
    policy_type = "Predefined"
    policy_name = "AppGwSslPolicy20220101"
  }

  tags = {}
}
