/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

// A simple DI registry to register and initialize services
// Each service is registered with a name and an async init function
// The init function is called during startup to initialize the service
// The init function can take a context object, which can be used to pass in dependencies
// The init function should register the initialized service in the container
const registry = new Map();
function register(name, initFn) {
  registry.set(name, initFn);
}

let initPromise = null;
async function startup(context = {}) {
  if (initPromise) return initPromise; // return true if already started
  // run all registered init functions sequentially
  initPromise = (async () => {
    for (const [name, initFn] of registry) {
      await initFn(context);
    }
    return true;
  })();

  return initPromise;
}

module.exports = { register, startup };
