const { EventGridPublisherClient, AzureKeyCredential } = require("@azure/eventgrid");
const { EventGridSenderClient, AzureKeyCredential: NamespaceAzureKeyCredential } = require("@azure/eventgrid-namespaces");
const { DefaultAzureCredential } = require("@azure/identity");

class EventGridClientFactory {
  constructor() {
    this.cache = new Map();
    this.debug = (process.env.EVENTGRID_DEBUG || false) === "true";
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
   * @param {string} [options.type=standard] - "standard" or "namespace" or "domain".
   */
  getClient({ endpoint, topic, clientId = null, key = null, type = "standard" }) {
    // === Required fields check ===
    if (!endpoint) {
      throw new Error("Missing required field: endpoint");
    }
    if (type === "namespace" && !topic) {
      throw new Error("Missing required field: topic (for namespace client)");
    }

    // === Build cache key ===
    const cacheKey = `${type}:${endpoint}:${topic || ""}`;
    if (this.cache.has(cacheKey)) {
      this.log(`Reusing cached ${type} client for endpoint=${endpoint} topic=${topic || "-"}`);
      return this.cache.get(cacheKey);
    }

    // === Select credential ===
    let credential;
    if (key) {
      credential = type === "namespace" ? new NamespaceAzureKeyCredential(key) : new AzureKeyCredential(key);
      this.log(`Using key credential for ${type} client`);
    } else {
      credential = clientId ? new DefaultAzureCredential({ managedIdentityClientId: clientId }) : new DefaultAzureCredential();
      this.log(`Using AAD credential (clientId=${clientId || "system-assigned"}) for ${type} client`);
    }

    // === Create raw client ===
    let rawClient;
    if (type === "namespace") {
      rawClient = new EventGridSenderClient(endpoint, credential, topic);
      this.log(`Created namespace client for topic=${topic} endpoint=${endpoint}`, rawClient);
    } else {
      rawClient = new EventGridPublisherClient(endpoint, "CloudEvent", credential);
      this.log(`Created standard client for endpoint=${endpoint}`, rawClient);
    }
    // === Wrap client to unify sendEvents method ===
    const clientWrapper = {
      type,
      endpoint,
      topic,
      rawClient,
      sendEvents: async (events) => {
        if (!events || !Array.isArray(events) || events.length === 0) {
          throw new Error("sendEvents requires a non-empty array of events");
        }
        if (type === "domain") {
          let moduleName = "quest5TierEg"; // TODO: make moduleName dynamic if needed
          events = events.map((event) => ({ ...event, source: topic + "-" + moduleName }));
        }
        this.log(`Sending events to Event Grid `, events, rawClient);
        return type === "namespace" ? rawClient.sendEvents(events) : rawClient.send(events);
      },
    };

    // Save into cache
    this.cache.set(cacheKey, clientWrapper);
    return clientWrapper;
  }
}

// Singleton
const eventGridFactory = new EventGridClientFactory();
module.exports = { eventGridFactory };
