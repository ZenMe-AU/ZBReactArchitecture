// From Eslint v8.21.0, .eslintrc* is no longer used. eslint.config.js is the default config file name.
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{ts,tsx, mts, cts}", "**/*.{js,jsx,mjs,cjs}"],
    plugins: {
      js,
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
];
