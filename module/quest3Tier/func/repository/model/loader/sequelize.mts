/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { DataTypes } from "@sequelize/core";

async function loadModels(sequelize, modelsDir) {
  const models = {};
  const modelExtension = import.meta.url.endsWith(".mts") ? ".mts" : ".mjs";
  console.log("Loading models from directory:", modelsDir);
  for (const file of fs.readdirSync(modelsDir)) {
    if (file.endsWith(modelExtension) && !file.endsWith(`.test${modelExtension}`)) {
      try {
        const { default: modelDefiner } = await import(pathToFileURL(path.join(modelsDir, file)).href);
        if (typeof modelDefiner !== "function") {
          console.warn(`[WARN] ${file} does not export a function. Skipped.`);
          continue;
        }
        const model = modelDefiner(sequelize, DataTypes);
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