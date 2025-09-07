const { Sequelize } = require("sequelize");
const { DefaultAzureCredential } = require("@azure/identity");
const { execSync } = require("child_process");
const { readFileSync, existsSync } = require("fs");
const { resolve, basename } = require("path");

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

/**
 * Run a shell command and return trimmed output
 */
function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

/**
 * Get TARGET_ENV from env var or .env file
 */
let TARGET_ENV;
function getTargetEnvName() {
  if (TARGET_ENV) return TARGET_ENV;

  const envFilePath = resolve(__dirname, "..", "..", "..", "..", "..", "deploy", ".env");
  if (existsSync(envFilePath)) {
    const envContent = readFileSync(envFilePath, "utf8");
    const match = envContent.match(/^TARGET_ENV=(.+)$/m);
    if (match && match[1]) {
      TARGET_ENV = match[1].trim();
      return TARGET_ENV;
    }
  }
  console.log("TARGET_ENV not found.");
  process.exit(1);
}

/**
 * Get MODULE_NAME from env var or directory name
 */
let MODULE_NAME;
function getModuleName() {
  if (MODULE_NAME) return MODULE_NAME;

  const moduleDirPath = resolve(__dirname, "..", "..", "..");
  MODULE_NAME = basename(moduleDirPath);
  if (!MODULE_NAME) {
    console.log("MODULE_NAME not found.");
    process.exit(1);
  }
  return MODULE_NAME;
}

/**
 * Get Azure Function App principalId and Azure AD token for PostgreSQL
 */
function getAzureVars({ functionAppName, resourceGroupName }) {
  const functionAppPrincipalId = run(`az functionapp identity show -n ${functionAppName} -g ${resourceGroupName} --query "principalId" -o tsv`);
  return { functionAppPrincipalId };
}

async function getAzureAccessToken() {
  const credential = new DefaultAzureCredential();
  const tokenObj = await credential.getToken("https://ossrdbms-aad.database.windows.net");
  return tokenObj.token;
}

/**
 * Create Sequelize connection using Azure AD token authentication
 */
async function createSequelizeConnection({ pgServerName, dbName, pgAdminUser }) {
  const token = await getAzureAccessToken();
  const sequelize = new Sequelize(dbName, pgAdminUser, token, {
    host: `${pgServerName}.postgres.database.azure.com`,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
  });
  return sequelize;
}

/**
 * Utility to check if role exists
 */
async function roleExists(sequelize, roleName) {
  const [results] = await sequelize.query(`SELECT 1 FROM pg_roles WHERE rolname = :roleName`, { replacements: { roleName } });
  return results.length > 0;
}

/**
 * Create read-write group if not exists
 */
async function createReadWriteGroup(sequelize, moduleName, dbName) {
  const roleName = getRwRoleName(moduleName);
  if (await roleExists(sequelize, roleName)) {
    console.log(`Role ${roleName} already exists. Skipping.`);
    return;
  }
  await sequelize.query(`
    CREATE ROLE "${roleName}" NOLOGIN;
    GRANT CONNECT ON DATABASE "${dbName}" TO "${roleName}";
    GRANT USAGE ON SCHEMA public TO "${roleName}";
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${roleName}";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${roleName}";
  `);
  console.log(`Created role ${roleName}`);
}

/**
 * Create read-only group if not exists
 */
async function createReadOnlyGroup(sequelize, moduleName, dbName) {
  const roleName = getRoRoleName(moduleName);
  if (await roleExists(sequelize, roleName)) {
    console.log(`Role ${roleName} already exists. Skipping.`);
    return;
  }
  await sequelize.query(`
    CREATE ROLE "${roleName}" NOLOGIN;
    GRANT CONNECT ON DATABASE "${dbName}" TO "${roleName}";
    GRANT USAGE ON SCHEMA public TO "${roleName}";
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO "${roleName}";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO "${roleName}";
  `);
  console.log(`Created role ${roleName}`);
}

/**
 * Grant Function App permissions if not already granted
 */
async function grantFunctionAppPermissions(sequelize, moduleName, functionAppName, functionAppPrincipalId) {
  const rwRoleName = getRwRoleName(moduleName);

  const [exists] = await sequelize.query(
    `SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON m.roleid = r.oid
     JOIN pg_roles u ON m.member = u.oid
     WHERE r.rolname = :rwRoleName AND u.rolname = :functionAppName`,
    { replacements: { rwRoleName, functionAppName } }
  );

  if (exists.length > 0) {
    console.log(`Function App ${functionAppName} already has role ${rwRoleName}. Skipping.`);
    return;
  }

  await sequelize.query(`
    SELECT * FROM pg_catalog.pgaadauth_create_principal_with_oid(
      E'${functionAppName}'::text,
      E'${functionAppPrincipalId}'::text,
      'service'::text,
      false,
      false
    );
    GRANT "${rwRoleName}" TO "${functionAppName}";
  `);
  console.log(`Granted ${rwRoleName} to ${functionAppName}`);
}

/**
 * Grant rw access to the server admin aad group
 */
async function grantAdminRole(sequelize, moduleName, pgAdminUser) {
  const rwRoleName = getRwRoleName(moduleName);

  const [exists] = await sequelize.query(
    `SELECT 1 FROM pg_auth_members m
     JOIN pg_roles r ON m.roleid = r.oid
     JOIN pg_roles u ON m.member = u.oid
     WHERE r.rolname = :rwRoleName AND u.rolname = :pgAdminUser`,
    { replacements: { rwRoleName, pgAdminUser } }
  );

  if (exists.length > 0) {
    console.log(`Admin user ${pgAdminUser} already has role ${rwRoleName}. Skipping.`);
    return;
  }

  await sequelize.query(`GRANT "${rwRoleName}" TO "${pgAdminUser}"`);
  console.log(`Granted ${rwRoleName} to ${pgAdminUser}`);
}

/**
 * Grant schema admin access
 */
async function grantSchemaAdminRole(sequelize, moduleName) {
  const schemaAdminRoleName = `${moduleName}_schemaAdmin_role`;
  await sequelize.query(`
    CREATE ROLE "${schemaAdminRoleName}" NOLOGIN;
    GRANT CREATE ON SCHEMA public TO "${schemaAdminRoleName}"`);

  console.log(`GRANT CREATE ON SCHEMA public TO ${schemaAdminRoleName}`);
}

/**
 * Add a temporary firewall rule for your current IP
 */
function addTemporaryFirewallRule({ resourceGroup, serverName, ruleName, ip }) {
  console.log(`Adding temporary firewall rule ${ruleName} for IP ${ip}`);
  execSync(
    `az postgres flexible-server firewall-rule create \
     --resource-group ${resourceGroup} \
     --name ${serverName} \
     --rule-name ${ruleName} \
     --start-ip-address ${ip} \
     --end-ip-address ${ip}`,
    { stdio: "inherit" }
  );
}

/**
 * Remove the temporary firewall rule
 */
function removeTemporaryFirewallRule({ resourceGroup, serverName, ruleName }) {
  console.log(`Removing temporary firewall rule ${ruleName}`);
  execSync(
    `az postgres flexible-server firewall-rule delete \
     --resource-group ${resourceGroup} \
     --name ${serverName} \
     --rule-name ${ruleName} \
     --yes`,
    { stdio: "inherit" }
  );
}

const MY_IP = execSync("curl -s https://api.ipify.org").toString().trim(); // get current public IP
const TEMP_RULE_NAME = "temp-access-rule";

/**
 * Main execution
 */
(async function main() {
  const targetEnv = getTargetEnvName();
  const moduleName = getModuleName();
  const resourceGroupName = getResourceGroupName(targetEnv);
  const pgServerName = getPgServerName(targetEnv);
  const pgAdminUser = getPgAdminUser(targetEnv);
  const functionAppName = getFunctionAppName(targetEnv, moduleName);
  //   const dbName = moduleName;
  const dbName = "postgres";

  const { functionAppPrincipalId } = getAzureVars({ functionAppName, resourceGroupName });

  addTemporaryFirewallRule({ resourceGroup: resourceGroupName, serverName: pgServerName, ruleName: TEMP_RULE_NAME, ip: MY_IP });

  const sequelize = await createSequelizeConnection({
    pgServerName,
    dbName,
    pgAdminUser,
  });

  try {
    await createReadWriteGroup(sequelize, moduleName, dbName);
    await createReadOnlyGroup(sequelize, moduleName, dbName);
    await grantFunctionAppPermissions(sequelize, moduleName, functionAppName, functionAppPrincipalId);
    await grantAdminRole(sequelize, moduleName, pgAdminUser); // for development
    await grantSchemaAdminRole(sequelize, moduleName);
  } finally {
    await sequelize.close();
    removeTemporaryFirewallRule({ resourceGroup: resourceGroupName, serverName: pgServerName, ruleName: TEMP_RULE_NAME });
  }

  console.log("All actions completed.");
})();

// deploy database security

// # Move to CI/CD Pipeline
// # Get the Azure AD group for PostgreSQL admin

// # Create role group for function app
// resource "null_resource" "create_role_group" {
//   provisioner "local-exec" {
//     command = <<EOT
//     export PGPASSWORD=$(az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv)
//     psql "host=${data.azurerm_postgresql_flexible_server.pg_server.name}.postgres.database.azure.com port=5432 dbname=${azurerm_postgresql_flexible_server_database.module_db.name} user=${data.azuread_group.pg_admin_group.display_name} sslmode=require" \
//     -c "CREATE ROLE \"${var.module_name}_rw_group\" NOLOGIN;" \
//     -c "GRANT CONNECT ON DATABASE \"${azurerm_postgresql_flexible_server_database.module_db.name}\" TO \"${var.module_name}_rw_group\";" \
//     -c "GRANT USAGE ON SCHEMA public TO \"${var.module_name}_rw_group\";" \
//     -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO \"${var.module_name}_rw_group\";" \
//     -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO \"${var.module_name}_rw_group\";" \

//     -c "CREATE ROLE \"${var.module_name}_ro_group\" NOLOGIN;" \
//     -c "GRANT CONNECT ON DATABASE \"${azurerm_postgresql_flexible_server_database.module_db.name}\" TO \"${var.module_name}_ro_group\";" \
//     -c "GRANT USAGE ON SCHEMA public TO \"${var.module_name}_ro_group\";" \
//     -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"${var.module_name}_ro_group\";" \
//     -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO \"${var.module_name}_ro_group\";" \

//     -c "SELECT * FROM pg_catalog.pgaadauth_create_principal_with_oid(E'${azurerm_linux_function_app.fa.name}'::text, E'${azurerm_linux_function_app.fa.identity[0].principal_id}'::text, 'service'::text, false, false);" \
//     -c "GRANT \"${var.module_name}_rw_group\" TO \"${azurerm_linux_function_app.fa.name}\";"
//     EOT
//   }
// }
// SELECT * FROM pg_catalog.pgaadauth_create_principal_with_oid('questionV3-fa', '8b2e6533-872b-4592-83a5-3ff2bc90266d', 'service', false, false);
// select * from pg_catalog.pgaadauth_list_principals(false);
