/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

function createMigrationInstance({ type = "default", db, migrationDir }) {
  switch (type) {
    default:
      return require("./umzug.mjs").default.createUmzugInstance(db, migrationDir);
  }
}

module.exports = { createMigrationInstance };
