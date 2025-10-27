/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

const { DefaultAzureCredential } = require("@azure/identity");

class clientWebhook {
  rawClient = null;
  credential = null;
  type = "webhook";
  endpoint = null;
  // queueFunctionName = null;

  constructor({ endpoint, clientId }) {
    if (!endpoint) {
      throw new Error("Missing required field: endpoint");
    }
    this.endpoint = endpoint;
    this.credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
    console.log(`Using AAD credential (clientId=${clientId || "system-assigned"}) for ${this.type} client`);
  }

  sendEvents = (events) => {
    if (!events || !Array.isArray(events) || events.length === 0) {
      throw new Error("sendEvents requires a non-empty array of events");
    }
    const funcMetaData = require("../funcMetaData");
    const matchingCommand = funcMetaData.commands.find((cmd) => events[0].type === cmd.subscriptionFilter);
    if (!matchingCommand) {
      console.log(`No subscriber found for event type: ${events[0].type}`);
      return;
    }
    fetch(this.endpoint + "/runtime/webhooks/EventGrid?functionName=" + matchingCommand.queueFuncName, {
      method: "POST",
      headers: {
        "aeg-event-type": "Notification",
        "Content-Type": "application/json",
        // Authorization: `Bearer ${this.credential.getToken()}`,
      },
      body: JSON.stringify(events),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to send events to Webhook: ${response.statusText}`);
        }
        console.log(`Successfully sent events to Webhook`, events);
      })
      .catch((error) => {
        console.error(`Error sending events to Webhook:`, error);
      });
    return;
  };
}

module.exports = clientWebhook;
