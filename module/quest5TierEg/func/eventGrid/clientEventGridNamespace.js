/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { EventGridSenderClient } = require("@azure/eventgrid-namespaces");
const { DefaultAzureCredential } = require("@azure/identity");

class clientEventGridNamespace {
  rawClient = null;
  credential = null;
  type = "eventGridNamespace";
  endpoint = null;
  topic = null;

  constructor({ endpoint, clientId, topic }) {
    if (!endpoint) {
      throw new Error("Missing required field: endpoint");
    }
    if (!topic) {
      throw new Error("Missing required field: topic (for namespace client)");
    }
    this.credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
    console.log(`Using AAD credential (clientId=${clientId || "system-assigned"}) for ${this.type} client`);

    this.rawClient = new EventGridSenderClient(endpoint, this.credential, topic);
    this.log(`Created namespace client for topic=${topic} endpoint=${endpoint}`, this.rawClient);
  }

  sendEvents = (events) => {
    if (!events || !Array.isArray(events) || events.length === 0) {
      throw new Error("sendEvents requires a non-empty array of events");
    }
    console.log(`Sending events to Event Grid `, events, this.rawClient);

    return this.rawClient.sendEvents(events);
  };
}

module.exports = clientEventGridNamespace;
