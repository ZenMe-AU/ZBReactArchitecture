const { EventGridPublisherClient, AzureKeyCredential } = require("@azure/eventgrid");
const { DefaultAzureCredential } = require("@azure/identity");

class clientEventGridTopic {
  rawClient = null;
  credential = null;
  type = "eventGridTopic";
  endpoint = null;
  topic = null;

  constructor({ endpoint, clientId }) {
    if (!endpoint) {
      throw new Error("Missing required field: endpoint");
    }
    this.credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
    console.log(`Using AAD credential (clientId=${clientId || "system-assigned"}) for ${this.type} client`);

    this.rawClient = new EventGridPublisherClient(endpoint, "CloudEvent", this.credential);
    console.log(`Created event grid topic client for endpoint=${endpoint}`, this.rawClient);
  }

  sendEvents = (events) => {
    if (!events || !Array.isArray(events) || events.length === 0) {
      throw new Error("sendEvents requires a non-empty array of events");
    }
    console.log(`Sending events to Event Grid `, events, this.rawClient);

    return this.rawClient.send(events);
  };
}

module.exports = clientEventGridTopic;
