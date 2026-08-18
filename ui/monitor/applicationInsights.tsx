/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { ReactPlugin } from "@microsoft/applicationinsights-react-js";
import { ClickAnalyticsPlugin } from "@microsoft/applicationinsights-clickanalytics-js";
import { getConfig } from "../config/loadConfig";
// TODO: inject runtime configuration instead of hardcoding
// const appInsightsConnectionString = getConfig("APPINSIGHTS_CONNECTION_STRING") || "";

const reactPlugin = new ReactPlugin();

// *** Add the Click Analytics plug-in. ***
const clickPluginInstance = new ClickAnalyticsPlugin();
const clickPluginConfig = {
  // autoCapture: true,
  autoCapture: false,
};
const appInsights = new ApplicationInsights({
  config: {
    connectionString:
      "InstrumentationKey=89e9d413-d3d2-4b31-92b6-13a9a7763d7f;IngestionEndpoint=https://australiaeast-1.in.applicationinsights.azure.com/;LiveEndpoint=https://australiaeast.livediagnostics.monitor.azure.com/;ApplicationId=7f3e1758-daf9-493a-aa9b-f54e3c519020",
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
