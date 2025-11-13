/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export default {
  "*.{js,jsx,ts,tsx}": ["pnpm exec prettier --write --"],
  "{package.json,pnpm-lock.yaml}": ["node .codingstandards/checkLockfile.mjs"],
};
