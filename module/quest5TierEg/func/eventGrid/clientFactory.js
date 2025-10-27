class EventGridClientFactory {
  constructor() {
    // this.debug = (process.env.EVENTGRID_DEBUG || false) === "true";
    this.debug = true;
  }

  log(...args) {
    if (this.debug) {
      console.log("[EventGridFactory]", ...args);
    }
  }

  /**
   * Create or retrieve an Event Grid client.
   * @param {Object} options
   * @param {string} options.endpoint - Event Grid endpoint (required).
   * @param {string} [options.topic] - Namespace topic (required for namespace type).
   * @param {string} [options.clientId] - Managed Identity clientId (optional).
   * @param {string} [options.key] - Access Key (optional).
   * @param {string} [options.type=eventGridTopic] - "eventGridTopic" or "eventGridNamespace" or "webhook".
   */
  static getClient({ endpoint, topic, clientId = null, type = "eventGridTopic" }) {
    // === Required fields check ===
    if (!endpoint) {
      throw new Error("Missing required field: endpoint");
    }
    if (type === "eventGridNamespace" && !topic) {
      throw new Error("Missing required field: topic (for namespace client)");
    }

    let clientWrapper;
    switch (type) {
      case "eventGridNamespace":
        const clientEventGridNamespace = require("./clientEventGridNamespace");
        clientWrapper = new clientEventGridNamespace({ endpoint, topic, clientId });
      case "webhook":
        const clientWebhook = require("./clientWebhook");
        clientWrapper = new clientWebhook({ endpoint, clientId });
        break;
      case "eventEmitter":
        const clientEventEmitter = require("./clientEventEmitter");
        clientWrapper = new clientEventEmitter({ endpoint });
        break;
      case "eventGridTopic":
      default:
        const clientEventGridTopic = require("./clientEventGridTopic");
        clientWrapper = new clientEventGridTopic({ endpoint, clientId });
    }
    return clientWrapper;
  }
}

module.exports = EventGridClientFactory;
