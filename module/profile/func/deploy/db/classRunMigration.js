/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import path from "path";
import { createMigrationInstance } from "./migration/tool/index.js";
import __reqoc62vl from "../../../../../deploy/util/envSetup.cjs";
const { getCurrentPublicIP, getTargetEnv } = __reqoc62vl;
import __reqozwxzc from "../../../../../deploy/util/namingConvention.cjs";
const { getResourceGroupName, getPgServerName } = __reqozwxzc;
import __reqkx04sk from "../../../../../deploy/util/azureCli.cjs";
const { addTemporaryFirewallRule, removeTemporaryFirewallRule } = __reqkx04sk;
const { addPgServerExtensionsList, getSubscriptionId } = __reqkx04sk;

class classRunMigration {
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

export { classRunMigration };
