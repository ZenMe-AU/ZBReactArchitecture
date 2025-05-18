import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js";

import { createBrowserHistory } from "history";

const browserHistory = createBrowserHistory();
const reactPlugin = new ReactPlugin();

// *** Add the Click Analytics plug-in. ***
var clickPluginInstance = new ClickAnalyticsPlugin();
var clickPluginConfig = {
  // autoCapture: true,
  autoCapture: false,
};
const appInsights = new ApplicationInsights({
  config: {
    // connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,
    connectionString:
      "InstrumentationKey=c15a2189-babb-4591-ae95-8d3fc77edb6a;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=826f77d1-90d9-44e4-a93f-767d81985212",
    enableAutoRouteTracking: true,
    disableFetchTracking: false,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    enableAjaxErrorStatusText: true,
    // *** If you're adding the Click Analytics plug-in, delete the next line. ***
    // extensions: [reactPlugin],
    // *** Add the Click Analytics plug-in. ***
    extensions: [reactPlugin, clickPluginInstance],
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory },
      // *** Add the Click Analytics plug-in. ***
      [clickPluginInstance.identifier]: clickPluginConfig,
    },
  },
});

appInsights.loadAppInsights();

export { browserHistory, appInsights };
