/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

class Container {
  registry: Map<string, any>;
  singletons: Map<string, any>;

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

export default container;
