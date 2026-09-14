/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import devToolsJson from "vite-plugin-devtools-json";

export default defineConfig(() => {
  return {
    plugins: [reactRouter(), devToolsJson()],
    build: {
      target: "esnext",
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
