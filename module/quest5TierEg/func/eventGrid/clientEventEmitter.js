const EventEmitter = require("events");

class clientEventEmitter {
  rawClient = null;
  credential = null;
  type = "eventEmitter";
  endpoint = null;
  topic = null;

  constructor({ endpoint }) {
    if (!endpoint) {
      throw new Error("Missing required field: endpoint");
    }
    this.endpoint = endpoint;
    this.rawClient = new EventEmitter();
    console.log(`Created event grid emitter client for endpoint=${endpoint}`, this.rawClient);
  }

  sendEvents = (events) => {
    if (!events || !Array.isArray(events) || events.length === 0) {
      throw new Error("sendEvents requires a non-empty array of events");
    }
    const funcMetaData = require("../funcMetaData");
    const matchingCommand = funcMetaData.commands.find((cmd) => events[0].type === cmd.subscriptionFilter);
    if (matchingCommand) {
      this.rawClient.on(
        events[0].type,
        function (events) {
          fetch(this.endpoint + "/runtime/webhooks/EventGrid?functionName=" + matchingCommand.queueFuncName, {
            method: "POST",
            headers: {
              "aeg-event-type": "Notification",
              "Content-Type": "application/json",
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
        }.bind(this)
      );
    }

    return this.rawClient.emit(events[0].type, events);
  };
}

module.exports = clientEventEmitter;
