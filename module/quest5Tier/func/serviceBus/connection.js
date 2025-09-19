const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");

function createServiceBusInstance({ namespace, clientId = null }) {
  if (!namespace) {
    throw new Error("Service bus namespace is required");
  }
  const credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
  return new ServiceBusClient(namespace, credential);
}

module.exports = { createServiceBusInstance };
