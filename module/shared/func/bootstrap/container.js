class Container {
  constructor() {
    this.registry = new Map();
    this.singletons = new Map();
  }

  register(name, resolver) {
    this.registry.set(name, resolver);
  }

  get(name) {
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }

    const resolver = this.registry.get(name);
    if (!resolver) {
      throw new Error(`Dependency "${name}" not found`);
    }

    const instance = typeof resolver === "function" ? resolver() : resolver;
    this.singletons.set(name, instance);
    return instance;
  }
}

const container = new Container();

module.exports = container;
