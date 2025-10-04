import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js";
import { getConfig } from "../config/loadConfig";
// const appInsightsConnectionString = getConfig("APPINSIGHTS_CONNECTION_STRING") || "";

const reactPlugin = new ReactPlugin();

// *** Add the Click Analytics plug-in. ***
var clickPluginInstance = new ClickAnalyticsPlugin();
var clickPluginConfig = {
  // autoCapture: true,
  autoCapture: false,
};
const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: "YOUR_INSTRUMENTATION_KEY",
    connectionString: "",
    // enableAutoRouteTracking: true,
    // disableFetchTracking: false,
    // enableRequestHeaderTracking: true,
    // enableResponseHeaderTracking: true,
    // enableAjaxErrorStatusText: true,
    enableAutoRouteTracking: false,
    disableFetchTracking: true,
    enableRequestHeaderTracking: false,
    enableResponseHeaderTracking: false,
    enableAjaxErrorStatusText: false,
    // enableCorsCorrelation: true,
    // *** If you're adding the Click Analytics plug-in, delete the next line. ***
    // extensions: [reactPlugin],
    // *** Add the Click Analytics plug-in. ***
    extensions: [reactPlugin, clickPluginInstance],
    extensionConfig: {
      [reactPlugin.identifier]: {},
      // *** Add the Click Analytics plug-in. ***
      [clickPluginInstance.identifier]: clickPluginConfig,
    },
  },
});

appInsights.addTelemetryInitializer((envelope) => {
  if (envelope.tags) {
    envelope.tags["ai.cloud.role"] = "FrontendApp";
    envelope.tags["ai.cloud.roleInstance"] = "UI1";
  }

  // envelope.data.baseData.target = "FunctionApp:LocalChat";
  console.log(envelope);
});

appInsights.loadAppInsights();

export { appInsights };
