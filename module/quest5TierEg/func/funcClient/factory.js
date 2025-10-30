/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

class Factory {
  constructor() {}

  static _instances = {};

  static getClient(type = "funcClientFake") {
    if (Factory._instances[type]) {
      return Factory._instances[type];
    }
    let clientWrapper;
    switch (type) {
      case "funcClientAzLocal":
        const funcClientAzLocal = require("./funcClientAzLocal");
        clientWrapper = new funcClientAzLocal();
        break;
      case "funcClientAzure":
        const funcClientAzure = require("./funcClientAzure.js");
        clientWrapper = new funcClientAzure();
        break;
      case "funcClientFake":
      default:
        const funcClientFake = require("./funcClientFake");
        clientWrapper = new funcClientFake();
    }
    Factory._instances[type] = clientWrapper;
    console.log(`Constructed ${type} client`);
    console.log(`Client details: ${JSON.stringify(clientWrapper)}`);

    return clientWrapper;
  }
}

module.exports = Factory;
