/**
 * Naming convention helpers
 */
function getResourceGroupName(targetEnv) {
  return `${targetEnv}-resources`;
}
function getPgServerName(targetEnv) {
  return `${targetEnv}-postgresqlserver`;
}
function getPgAdminUser(targetEnv) {
  return `${targetEnv}-pg-admins`;
}
function getFunctionAppName(targetEnv, moduleName) {
  return `${targetEnv}-${moduleName}-func`;
}
function getRwRoleName(moduleName) {
  return `${moduleName}_rw_group`;
}
function getRoRoleName(moduleName) {
  return `${moduleName}_ro_group`;
}
function getDbSchemaAdminName(moduleName) {
  return `${moduleName}-dbschemaadmins`;
}
