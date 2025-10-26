// From Eslint v8.21.0, .eslintrc* is no longer used. eslint.config.js is the default config file name.

import rootConfig from "../eslint.config.js";
import pluginReact from "eslint-plugin-react";

export default [
  ...rootConfig, // Extend the root configuration
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    settings: { react: { version: "detect" } },
  },
  {
    ignores: ["**/dist/**", "**/.react-router/**"],
  },
];
