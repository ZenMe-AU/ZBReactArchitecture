const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

function loadModels(sequelize, modelsDir) {
  const models = {};
  console.log("Loading models from directory:", modelsDir);
  fs.readdirSync(modelsDir).forEach((file) => {
    if (file.endsWith(".js") && !file.endsWith(".test.js")) {
      try {
        const modelDefiner = require(path.join(modelsDir, file));
        if (typeof modelDefiner !== "function") {
          console.warn(`[WARN] ${file} does not export a function. Skipped.`);
          return;
        }
        const model = modelDefiner(sequelize, Sequelize.DataTypes);
        if (!model || !model.name) {
          console.warn(`[WARN] ${file} did not return a valid model. Skipped.`);
          return;
        }
        models[model.name] = model;
      } catch (error) {
        console.error(`[ERROR] Failed to load ${file}:`, error);
      }
    }
  });

  Object.keys(models).forEach((name) => {
    if (models[name].associate) {
      models[name].associate(models);
    }
  });

  return models;
}

module.exports = { loadModels };
