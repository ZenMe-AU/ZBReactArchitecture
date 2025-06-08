import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.css";
import { appInsights } from "./monitor/applicationInsights";

export function renderApp(AppComponent: React.ReactElement) {
  appInsights.trackPageView();
  console.log("Rendering app...");
  console.log("App component:", AppComponent);

  const rootElement = document.getElementById("root");
  console.log("Root element:", rootElement);
  if (!rootElement) {
    throw new Error("Missing #root element in index.html");
  }

  ReactDOM.createRoot(rootElement).render(<React.StrictMode>{AppComponent}</React.StrictMode>);
}
