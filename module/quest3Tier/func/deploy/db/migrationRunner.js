/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const path = require("path");
const { createMigrationInstance } = require("./migration/tool/index.js");
const { getCurrentPublicIP, getTargetEnv } = require("../util/envSetup.js");
const { getResourceGroupName, getPgServerName } = require("../util/namingConvention.js");
const { addTemporaryFirewallRule, removeTemporaryFirewallRule } = require("../util/azureCli.js");

class MigrationRunner {
  constructor({ db, migrationDir, envType, targetEnv }) {
    this.db = db;
    this.migration = createMigrationInstance({ db, migrationDir });

    this.resourceGroupName = getResourceGroupName(envType, targetEnv);
    this.pgServerName = getPgServerName(targetEnv);
    this.firewallRuleName = "temp-access-rule";
    this.extensionNames = [];
  }

  async run(direction = "up") {
    const ip = getCurrentPublicIP();
    if (this.extensionNames.length > 0) {
      const { addPgServerExtensionsList, getSubscriptionId } = require("../util/azureCli.js");
      addPgServerExtensionsList({
        resourceGroup: this.resourceGroupName,
        serverName: this.pgServerName,
        subscriptionId: getSubscriptionId(),
        extensionNames: this.extensionNames,
      });
      console.log(`Enabled PostgreSQL extensions: ${this.extensionNames.join(", ")}`);
    }
    addTemporaryFirewallRule({
      resourceGroup: this.resourceGroupName,
      serverName: this.pgServerName,
      ruleName: this.firewallRuleName,
      ip,
    });
    try {
      if (direction === "down") {
        await this.migration.down();
        console.log(`[${this.constructor.name}] Migrations DOWN performed successfully.`);
      } else {
        await this.migration.up();
        console.log(`[${this.constructor.name}] All migrations performed successfully.`);
      }
    } catch (err) {
      console.error(`[${this.constructor.name}] Migration ${direction.toUpperCase()} failed:`, err);
      process.exit(1);
    } finally {
      await this.db.close();
      removeTemporaryFirewallRule({
        resourceGroup: this.resourceGroupName,
        serverName: this.pgServerName,
        ruleName: this.firewallRuleName,
      });
    }
  }
}

module.exports = MigrationRunner;
