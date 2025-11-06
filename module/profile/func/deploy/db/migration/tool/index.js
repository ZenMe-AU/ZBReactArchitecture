/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

function createMigrationInstance({ type = "default", db, migrationDir }) {
  switch (type) {
    default:
      return require("./umzug").createUmzugInstance(db, migrationDir);
  }
}

module.exports = { createMigrationInstance };
