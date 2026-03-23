/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  esbuild: {
    jsx: "automatic", // this is just a workaround for not having tsconfig.json set up yet
  },
  plugins: [
    federation({
      name: "quest3TierRemote",
      filename: "remoteEntry.js",
      exposes: {
        "./AppRoutes": "./AppRoutes.tsx",
      },
      shared: ["react", "react-dom", "react-router", "react-router-dom"],
    }),
  ],
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
    port: 5174,
    strictPort: true,
  },
});
