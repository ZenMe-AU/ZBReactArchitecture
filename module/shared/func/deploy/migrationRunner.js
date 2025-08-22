const path = require("path");
const { createMigrationInstance } = require("../db/migration");
const { getCurrentPublicIP, getTargetEnv } = require("./util/envSetup.js");
const { addTemporaryFirewallRule, removeTemporaryFirewallRule } = require("./util/azureCli.js");

class MigrationRunner {
  constructor({ db, migrationDir }) {
    this.db = db;
    this.migration = createMigrationInstance({ db, migrationDir });

    this.targetEnv = getTargetEnv();
    this.resourceGroupName = `${this.targetEnv}-resources`;
    this.pgServerName = `${this.targetEnv}-postgresqlserver`;
    this.firewallRuleName = "temp-access-rule";
  }

  async run(direction = "up") {
    const ip = getCurrentPublicIP();
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
