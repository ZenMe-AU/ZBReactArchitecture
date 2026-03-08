/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ isSsrBuild }) => {
  const mfPlugin = federation({
    name: "uiHost",
    remotes: {
      quest3TierRemote: process.env.VITE_QUEST3TIER_REMOTE_URL ?? "http://localhost:5174/assets/remoteEntry.js",
      quest5TierRemote: process.env.VITE_QUEST5TIER_REMOTE_URL ?? "http://localhost:5175/assets/remoteEntry.js",
      quest5TierEgRemote: process.env.VITE_QUEST5TIEREG_REMOTE_URL ?? "http://localhost:5176/assets/remoteEntry.js",
    },
    shared: ["react", "react-dom", "react-router", "react-router-dom"],
  });
  const plugins = isSsrBuild ? [reactRouter()] : [mfPlugin, reactRouter()];

  return {
    plugins,
    build: {
      target: "esnext",
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});
