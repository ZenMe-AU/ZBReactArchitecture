// use in process repository calls for testing

// import { request } from "http";

module.exports = class FuncClientFake {
  type = "funcClientFake";

  constructor() {
    this.container = new Container();
    console.log(`Constructed ${this.type} client`);
  }

  http(funcName, options) {
    this.container.register(funcName, options);
    console.log(`HTTP function created: ${funcName}`);
  }

  eventGrid(funcName, options) {
    this.container.register(funcName, options);
    console.log(`EventGrid function created: ${funcName}`);
  }

  async fetch(url, { headers = {}, method = "GET", body = null }) {
    const urlObj = new URL(url, "http://fake.com");
    const route = urlObj.pathname.replace(/^\//, "");
    const query = urlObj.searchParams;
    const { funcName, options, params } = this.container.findByRoute(route, method);
    // mock headers with .get()
    const makeGettable = (obj) => {
      const map = new Map();
      for (const key in obj) {
        map.set(key.toLowerCase(), obj[key]);
      }
      return {
        get: (key) => map.get(key.toLowerCase()),
        ...obj,
      };
    };

    // mock request
    const request = {
      method,
      headers: makeGettable(headers),
      query,
      body,
      params,
      url,
      async json() {
        if (typeof body === "string") {
          try {
            return JSON.parse(body);
          } catch {
            return {};
          }
        }
        return body || {};
      },
    };

    // mock context
    const context = {
      log: console,
      bindings: {},
      functionName: funcName,
    };

    const result = await options.handler(request, context);
    // mock response
    return {
      ok: result.status >= 200 && result.status < 300,
      status: result.status,
      headers: {
        get: (key) => result.headers?.[key],
        ...result.headers,
      },
      async json() {
        // let resultObj = await result;
        // return await resultObj.jsonBody;
        return result.jsonBody;
      },
      text() {
        return JSON.stringify(result.jsonBody);
      },
    };
  }

  async fetchEventGrid(funcName, events = []) {
    const resolver = this.container.registry.get(funcName);
    if (!resolver) throw new Error(`No EventGrid function registered: ${funcName}`);
    const context = {
      log: console,
      bindings: {},
      functionName: funcName,
    };
    const result = await resolver.handler(events[0] ?? {}, context);
    if (result instanceof Promise) {
      return result.then((resolved) => ({ result: resolved }));
    }
    return { result };
  }

  //   close() {
  //     if (this.container && typeof this.container.clear === "function") {
  //       this.container.clear();
  //     }
  //   }
};

class Container {
  constructor() {
    this.registry = new Map(); // key: funcName, value: options
    this.singletons = new Map();
  }

  register(funcName, resolver) {
    this.registry.set(funcName, resolver);
  }

  matchRoute(routeTemplate, actualRoute) {
    const varNames = [];
    const regexStr = routeTemplate.replace(/\{([^}]+)\}/g, (_, name) => {
      varNames.push(name);
      return "([^/]+)";
    });
    const regex = new RegExp("^" + regexStr + "$", "i");
    const match = actualRoute.match(regex);
    if (!match) return null;
    const params = {};
    varNames.forEach((name, idx) => {
      params[name] = match[idx + 1];
    });
    return params;
  }

  findByRoute(actualRoute, method) {
    for (const [funcName, options] of this.registry.entries()) {
      if (!options.route) continue;
      const params = this.matchRoute(options.route, actualRoute);
      if (params && Array.isArray(options.methods)) {
        if (options.methods.map((m) => m.toUpperCase()).includes(method.toUpperCase())) {
          return { funcName, options, params };
        }
      }

      //   if (params && !options.methods) {
      //     return { funcName, options, params };
      //   }
    }
    throw new Error(`No matching route/method found`);
  }

  //   clear() {
  //     this.registry.clear();
  //     this.singletons.clear();
  //   }
}
