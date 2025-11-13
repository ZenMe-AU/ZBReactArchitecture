/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

export default {
  "*.{js,jsx,ts,tsx,mjs,cjs}": ["pnpm exec prettier --write --"],
  "package.json": ["node .codingstandards/checkLockfile.mjs"],
  "pnpm-lock.yaml": ["node .codingstandards/checkLockfile.mjs"],
};
