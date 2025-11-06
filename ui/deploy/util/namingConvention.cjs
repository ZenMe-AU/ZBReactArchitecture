/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

/**
 * This file sets the global naming standards for resources in this application when creating the environment.
 * The file will be called from every script that need to reference these resource names.
 * At deploy time, these names will be saved to the relevant configuration settings location
 * (e.g. .env file, Azure App Configuration, etc.) so that the application code can reference them.
 */
function getResourceGroupName(envType, targetEnv) {
  return `${envType}-${targetEnv}`;
}
function getStorageAccountName(targetEnv) {
  return `${targetEnv}pvt`.toLocaleLowerCase();
}
function getAppConfigName(targetEnv) {
  return `${targetEnv}-appconfig`;
}
function getPgServerName(targetEnv) {
  return `${targetEnv}-postgresqlserver`;
}
function getDbAdminName(envType) {
  const suffix = envType.charAt(0).toUpperCase() + envType.slice(1);
  return `DbAdmin-${suffix}`;
}
// function getPgAdminUser(targetEnv) {
//   return `${targetEnv}-pg-admins`;
// }
function getPgHost(targetEnv) {
  return `${getPgServerName(targetEnv)}.postgres.database.azure.com`;
}
function getLogAnalyticsWorkspaceName(targetEnv) {
  return `${targetEnv}-law`;
}
function getServiceBusName(targetEnv) {
  return `${targetEnv}-sbnamespace`;
}
function getServiceBusHost(targetEnv) {
  return `${getServiceBusName(targetEnv)}.servicebus.windows.net`;
}
function getIdentityName(targetEnv) {
  return `${targetEnv}-identity`;
}
function getAppInsightsName(targetEnv) {
  return `${targetEnv}-appinsights`;
}
// main ui
function getStorageAccountWebName(targetEnv) {
  return `${targetEnv}web`.toLocaleLowerCase();
}
// module level
function getFunctionAppName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-func`;
}
function getModuleServicePlanName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-plan`;
}
function getModuleStorageAccountContainerName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-stor`.toLocaleLowerCase();
}
function getRwRoleName(moduleName) {
  return `${moduleName}_rw_group`;
}
function getRoRoleName(moduleName) {
  return `${moduleName}_ro_group`;
}
function getDbSchemaAdminRoleName(moduleName) {
  return `${moduleName}_schemaAdmin_role`;
}
function getDbSchemaAdminName(moduleName) {
  return `${moduleName}-dbschemaadmins`;
}
function getEventGridName(targetEnv) {
  return `${targetEnv}-eg`;
}

module.exports = {
  getResourceGroupName,
  getStorageAccountName,
  getAppConfigName,
  getPgServerName,
  getDbAdminName,
  getPgHost,
  getLogAnalyticsWorkspaceName,
  getServiceBusName,
  getServiceBusHost,
  getIdentityName,
  getAppInsightsName,
  getStorageAccountWebName,
  getFunctionAppName,
  getModuleServicePlanName,
  getModuleStorageAccountContainerName,
  getRwRoleName,
  getRoRoleName,
  getDbSchemaAdminRoleName,
  getDbSchemaAdminName,
  getEventGridName,
};
