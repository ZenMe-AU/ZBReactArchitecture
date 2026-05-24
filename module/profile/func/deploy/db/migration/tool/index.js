/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import umzugTool from "./umzug.js";

function createMigrationInstance({ type = "default", db, migrationDir }) {
  switch (type) {
    default:
      return umzugTool.createUmzugInstance(db, migrationDir);
  }
}

export default { createMigrationInstance };
