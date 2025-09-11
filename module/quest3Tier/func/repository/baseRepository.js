const container = require("../di/diContainer");

class BaseRepository {
  constructor(modelMap = {}) {
    if (Array.isArray(modelMap)) {
      this._modelMap = Object.fromEntries(modelMap.map((name) => [name, name]));
    } else {
      this._modelMap = modelMap;
    }

    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop in target._modelMap) {
          const containerModelName = target._modelMap[prop];
          const models = container.get("models");
          if (!models[containerModelName]) {
            throw new Error(`Model ${containerModelName} not found in container`);
          }
          return models[containerModelName];
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }
}

module.exports = BaseRepository;
