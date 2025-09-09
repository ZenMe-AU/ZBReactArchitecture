/**
 * Utility to check if role exists
 */
async function roleExists(sequelize, roleName) {
  const [results] = await sequelize.query(`SELECT 1 FROM pg_roles WHERE rolname = :roleName`, { replacements: { roleName } });
  return results.length > 0;
}

/**
 *  Check if a member is part of a role
 */
async function hasMember(sequelize, member, roleName) {
  const result = await sequelize.query(`SELECT pg_has_role(:member, :roleName, 'member') AS "isMember"`, {
    replacements: { member, roleName },
    type: sequelize.QueryTypes.SELECT,
  });
  return result[0]?.isMember ?? false;
}
/**
 * Create read-write role if not exists
 */
async function createDbReadWriteRole(sequelize, roleName, dbName) {
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
 * Create read-only role if not exists
 */
async function createDbReadOnlyRole(sequelize, roleName, dbName) {
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
 * Create schema admin access
 */
async function createDbSchemaAdminRole(sequelize, roleName, dbName) {
  if (await roleExists(sequelize, roleName)) {
    console.log(`Role ${roleName} already exists. Skipping.`);
    return;
  }
  await sequelize.query(`
    CREATE ROLE "${roleName}" NOLOGIN;
    GRANT CONNECT ON DATABASE "${dbName}" TO "${roleName}";
    GRANT USAGE ON SCHEMA public TO "${roleName}";
    GRANT CREATE ON SCHEMA public TO "${roleName}";
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${roleName}";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${roleName}";
    `);

  console.log(`GRANT CREATE ON SCHEMA public TO ${roleName}`);
}

/**
 * Create a Azure AD login role
 */
async function createAadLoginRole(sequelize, roleName, objectId) {
  if (await roleExists(sequelize, roleName)) {
    console.log(`Role ${roleName} already exists. Skipping.`);
    return;
  }
  await sequelize.query(`
    SELECT * FROM pg_catalog.pgaadauth_create_principal_with_oid(
      E'${roleName}'::text,
      E'${objectId}'::text,
      'service'::text,
      false,
      false
    );
  `);
  // ALTER ROLE "${roleName}" WITH LOGIN;
  console.log(`Created role ${roleName}`);
}

/**
 * Grant role to user/role
 */
async function grantRole(sequelize, roleName, memberName) {
  if (await hasMember(sequelize, memberName, roleName)) {
    console.log(`User ${memberName} already has role ${roleName}. Skipping.`);
    return;
  }

  await sequelize.query(`GRANT "${roleName}" TO "${memberName}"`);
  console.log(`Granted ${roleName} to ${memberName}`);
}

module.exports = {
  createDbReadWriteRole,
  createDbReadOnlyRole,
  createDbSchemaAdminRole,
  createAadLoginRole,
  grantRole,
};
