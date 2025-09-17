const registry = new Map();
function register(name, initFn) {
  registry.set(name, initFn);
}

let initPromise = null;
async function startup(context = {}) {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    for (const [name, initFn] of registry) {
      await initFn(context);
    }
    return true;
  })();

  return initPromise;
}

module.exports = { register, startup };
