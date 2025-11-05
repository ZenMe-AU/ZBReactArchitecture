/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { getCurrentPublicIP } = require("../util/envSetup.js");
const {
  getObjectId,
  getFunctionAppPrincipalId,
  addTemporaryFirewallRule,
  removeTemporaryFirewallRule,
  addMemberToAadGroup,
} = require("../util/azureCli.js");
const { createDbReadWriteRole, createDbReadOnlyRole, createDbSchemaAdminRole, createAadLoginRole, grantRole } = require("./postgresql.js");

class DatabasePermissionManager {
  constructor({
    targetEnv,
    moduleName,
    functionAppName,
    resourceGroupName,
    pgServerName,
    pgAdminUserName,
    moduleDb,
    postgresDb,
    dbName,
    rwRoleName,
    roRoleName,
    dbSchemaAdminRoleName,
    dbSchemaAdminUserName,
  }) {
    this.targetEnv = targetEnv;
    this.moduleName = moduleName;
    this.functionAppName = functionAppName;
    this.resourceGroupName = resourceGroupName;
    this.pgServerName = pgServerName;
    this.pgAdminUserName = pgAdminUserName;
    this.moduleDb = moduleDb;
    this.postgresDb = postgresDb;
    this.dbName = dbName || moduleName;
    this.rwRoleName = rwRoleName;
    this.roRoleName = roRoleName;
    this.dbSchemaAdminRoleName = dbSchemaAdminRoleName;
    this.dbSchemaAdminUserName = dbSchemaAdminUserName;
    this.firewallRuleName = "temp-access-rule";
  }

  async run() {
    const objectId = getObjectId();
    const functionAppPrincipalId = getFunctionAppPrincipalId({ functionAppName: this.functionAppName, resourceGroupName: this.resourceGroupName });
    // addMemberToAadGroup({ groupIdOrName: this.pgAdminUserName, memberId: objectId });

    const ip = getCurrentPublicIP();
    addTemporaryFirewallRule({
      resourceGroup: this.resourceGroupName,
      serverName: this.pgServerName,
      ruleName: this.firewallRuleName,
      ip,
    });

    try {
      await createAadLoginRole(this.postgresDb, this.functionAppName, functionAppPrincipalId);
      await createDbReadWriteRole(this.moduleDb, this.rwRoleName, this.dbName);
      await createDbReadOnlyRole(this.moduleDb, this.roRoleName, this.dbName);
      await createDbSchemaAdminRole(this.moduleDb, this.dbSchemaAdminRoleName, this.dbName);
      await grantRole(this.moduleDb, this.rwRoleName, this.functionAppName);
      await grantRole(this.moduleDb, this.dbSchemaAdminRoleName, this.pgAdminUserName); // for development
      // await grantRole(this.moduleDb, this.dbSchemaAdminRoleName, this.dbSchemaAdminUserName);// for development
    } catch (err) {
      console.error("Failed to set up database roles:", err.message);
    } finally {
      await this.moduleDb.close();
      await this.postgresDb.close();
      removeTemporaryFirewallRule({
        resourceGroup: this.resourceGroupName,
        serverName: this.pgServerName,
        ruleName: this.firewallRuleName,
      });
    }
  }
}

module.exports = DatabasePermissionManager;
