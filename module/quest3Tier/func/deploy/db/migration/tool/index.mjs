/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { createUmzugInstance } from "./umzug.mjs";

function createMigrationInstance({ type = "default", db, migrationDir }) {
  switch (type) {
    default:
      return createUmzugInstance(db, migrationDir);
  }
}

export { createMigrationInstance };
