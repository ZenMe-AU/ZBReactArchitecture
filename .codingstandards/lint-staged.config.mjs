/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export default {
  // "../package.json": ["pnpm install --frozen-lockfile || (echo '❌ Lockfile out of sync. Run pnpm install and commit again.' && exit 1)"],
  // "../package.json": ["prettier --write"],
  // "../package.json": ["pnpm install --frozen-lockfile", "exit 2"],
  "{package.json,pnpm-lock.yaml}": ["node .codingstandards/checkLockfile.mjs"],
  "*.{js,jsx,ts,tsx}": ["pnpm exec prettier --write"],
  // "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
};
