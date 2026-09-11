/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const Sequelize = require("@sequelize/core");

async function loadModels(sequelize, modelsDir) {
  const models = {};
  console.log("Loading models from directory:", modelsDir);
  for (const file of fs.readdirSync(modelsDir)) {
    if (file.endsWith(".mjs") && !file.endsWith(".test.mjs")) {
      try {
        const { default: modelDefiner } = await import(pathToFileURL(path.join(modelsDir, file)).href);
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

module.exports = { loadModels };
