/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import { pathToFileURL } from "node:url";

async function loadModels(sequelize, modelsDir) {
  const models = {};
  console.log("Loading models from directory:", modelsDir);
  for (const file of fs.readdirSync(modelsDir)) {
    if (file.endsWith(".js") && !file.endsWith(".test.js")) {
      try {
        const modelModule = await import(pathToFileURL(path.join(modelsDir, file)).href);
        const modelDefiner = modelModule.default;
        if (typeof modelDefiner !== "function") {
          console.warn(`[WARN] ${file} does not export a function. Skipped.`);
          continue;
        }
        const model = modelDefiner(sequelize, Sequelize.DataTypes);
        if (!model || !model.name) {
          console.warn(`[WARN] ${file} did not return a valid model. Skipped.`);
          continue;
        }
        models[model.name] = model;
      } catch (error) {
        console.error(`[ERROR] Failed to load ${file}:`, error);
      }
    }
  }

  Object.keys(models).forEach((name) => {
    if (models[name].associate) {
      models[name].associate(models);
    }
  });

  return models;
}

export { loadModels };
