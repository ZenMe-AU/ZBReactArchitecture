/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");

function createServiceBusInstance({ namespace, clientId = null, connectionString }) {
  if (!namespace) {
    throw new Error("Service bus namespace is required");
  }
  if (connectionString) {
    return new ServiceBusClient(connectionString);
  } else {
    const credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
    return new ServiceBusClient(namespace, credential);
  }
}

module.exports = { createServiceBusInstance };
