/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import path from "path";
import { createMigrationInstance } from "./migration/tool/index.js";
import { getCurrentPublicIP, getTargetEnv } from "../../../../../deploy/util/envSetup.cjs";
import { getResourceGroupName, getPgServerName } from "../../../../../deploy/util/namingConvention.cjs";
import { addTemporaryFirewallRule, removeTemporaryFirewallRule } from "../../../../../deploy/util/azureCli.cjs";

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

export { classRunMigration };
