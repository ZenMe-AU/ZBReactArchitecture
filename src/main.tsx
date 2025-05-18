import React from "react";
import ReactDOM from "react-dom/client";
// import App from './App.tsx'
import App from "./Router.tsx";
import "bootstrap/dist/css/bootstrap.css";
import { appInsights } from "./applicationInsights";

appInsights.trackPageView();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
