/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    {
      name: "q3-local-config",
      configureServer(server) {
        server.middlewares.use("/env.json", (_request, response) => {
          response.setHeader("Content-Type", "application/json");
          response.setHeader("Cache-Control", "no-store");
          response.end(
            JSON.stringify({
              PROFILE_DOMAIN: "http://localhost:7072",
              QUEST3TIER_DOMAIN: "http://localhost:7073",
              QUEST3TIER_UI: "http://localhost:5183/quest3Tier",
            })
          );
        });
      },
    },
  ],
  esbuild: {
    jsx: "automatic", // this is just a workaround for not having tsconfig.json set up yet
  },
  build: {
    target: "esnext",
    minify: false,
    modulePreload: false,
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      "@zenmechat/shared-ui": fileURLToPath(new URL("../../../ui", import.meta.url)),
    },
  },
  server: {
    port: 5183,
    strictPort: true,
  },
});
