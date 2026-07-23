/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["vitest/**/*.test.mjs"],
    setupFiles: ["./vitest/vitest.setup.mjs"],
    globals: true,
    environment: "node",
  },
});
