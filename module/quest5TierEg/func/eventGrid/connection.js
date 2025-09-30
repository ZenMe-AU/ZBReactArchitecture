const { EventGridPublisherClient, AzureKeyCredential } = require("@azure/eventgrid");
const { EventGridSenderClient, EventGridReceiverClient } = require("@azure/eventgrid-namespaces");
const { DefaultAzureCredential } = require("@azure/identity");

function createEventGridInstance({ endpoint, clientId = null, key = null }) {
  if (!endpoint) {
    throw new Error("Event Grid endpoint is required");
  }
  let credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
  if (key) {
    credential = new AzureKeyCredential(key);
  }
  return new EventGridPublisherClient(endpoint, "CloudEvent", credential);
}

function createEventGridNamespaceInstance({ endpoint, clientId = null, key = null }) {
  if (!endpoint) {
    throw new Error("Event Grid endpoint is required");
  }
  let credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
  if (key) {
    credential = new AzureKeyCredential(key);
  }
  return new EventGridSenderClient(endpoint, "CloudEvent", credential);
}

module.exports = { createEventGridInstance };
