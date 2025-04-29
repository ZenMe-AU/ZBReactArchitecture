import { appInsights } from "./applicationInsights";

export const logPageView = (name: string, properties?: Record<string, any>) => {
  // console.log("Logging page view:", name, properties);
  name = document.title || "pageView:" + name;
  appInsights.trackPageView({
    name,
    properties,
  });
};

export const logEvent = (eventName: string, properties?: Record<string, any>) => {
  const actionType = "click";
  const parentId = "UnknownParent";
  const pageName = document.title || window.location.pathname;
  const userId = appInsights.context.user.id || "anonymous";
  const operationId = appInsights.context.telemetryTrace.traceID;
  const sessionId = appInsights.context?.sessionManager?.automaticSession?.id;

  appInsights.trackEvent({
    name: eventName,
    properties: {
      pageName,
      parentId,
      actionType,
      user_Id: userId,
      session_Id: sessionId,
      operation_Id: operationId,
      ...properties,
    },
  });
};

export const setUserContext = (userId: string) => {
  appInsights.setAuthenticatedUserContext(userId);
};

export const clearUserContext = () => {
  appInsights.clearAuthenticatedUserContext();
};
