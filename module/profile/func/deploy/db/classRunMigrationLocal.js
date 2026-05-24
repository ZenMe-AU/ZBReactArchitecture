/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import path from "path";
import { createMigrationInstance } from "./migration/tool/index.js";
import __reqhct4cq from "../../../../../deploy/util/envSetup.cjs";
const { getCurrentPublicIP, getTargetEnv } = __reqhct4cq;
import __reqmhv2dp from "../../../../../deploy/util/namingConvention.cjs";
const { getResourceGroupName, getPgServerName } = __reqmhv2dp;
import __reqe6aw82 from "../../../../../deploy/util/azureCli.cjs";
const { addTemporaryFirewallRule, removeTemporaryFirewallRule } = __reqe6aw82;

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

export default classRunMigration;
