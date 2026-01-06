/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// From Eslint v8.21.0, .eslintrc* is no longer used. eslint.config.js is the default config file name.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import licenseheader from "eslint-plugin-license-header";
import globals from "globals";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ["**/*.{ts,tsx,mts,cts}", "**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        // ...add more globals as needed
      },
    },
    plugins: {
      licenseheader,
    },
    rules: {
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-explicit-any": ["warn", { fixToUnknown: true, ignoreRestArgs: false }],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
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
