// From Eslint v8.21.0, .eslintrc* is no longer used. eslint.config.js is the default config file name.

import rootConfig from "../eslint.config.js";
import pluginReact from "eslint-plugin-react";

export default [
  ...rootConfig, // Extend the root configuration
  {
    plugins: {
      react: pluginReact,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
    },
    settings: { react: { version: "detect" } },
  },
];
