/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const path = require("path");
const { createMigrationInstance } = require("./migration/tool/index.js");
const { getCurrentPublicIP, getTargetEnv } = require("../../../../../deploy/util/envSetup.cjs");
const { getResourceGroupName, getPgServerName } = require("../../../../../deploy/util/namingConvention.cjs");
const { addTemporaryFirewallRule, removeTemporaryFirewallRule } = require("../../../../../deploy/util/azureCli.cjs");

class classRunMigration {
  constructor({ db, migrationDir, envType, targetEnv }) {
    this.db = db;
    this.migration = createMigrationInstance({ db, migrationDir });
    this.extensionNames = [];
  }

  async run(direction = "up") {
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
    }
  }
}

module.exports = classRunMigration;
