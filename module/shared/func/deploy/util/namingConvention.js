/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

/**
 * Naming convention helpers
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
function getLogAnalyticsWorkspaceName(targetEnv) {
  return `${targetEnv}-law`;
}
function getServiceBusName(targetEnv) {
  return `${targetEnv}-sbnamespace`;
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

module.exports = {
  getResourceGroupName,
  getStorageAccountName,
  getAppConfigName,
  getPgServerName,
  getDbAdminName,
  getLogAnalyticsWorkspaceName,
  getServiceBusName,
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
};
