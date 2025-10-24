/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// From Eslint v8.21.0, .eslintrc* is no longer used. eslint.config.js is the default config file name.

import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";

import licenseheader from "eslint-plugin-license-header";

export default [
  {
    files: ["**/*.{ts,tsx,mts,cts}", "**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        // ...add more browser globals as needed
      },
    },
    plugins: {
      js,
      "@typescript-eslint": tseslint,
      licenseheader,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-require-imports": "warn",
      "licenseheader/header": [
        "warn",
        [
          "/**",
          " * @license SPDX-FileCopyrightText: © " + new Date().getFullYear() + " Zenme Pty Ltd <info@zenme.com.au>",
          " * @license SPDX-License-Identifier: MIT",
          " */",
        ],
      ],
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    settings: {},
  },
];
