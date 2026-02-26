/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { useEffect } from "react";
import { Scripts, ScrollRestoration, isRouteErrorResponse, Outlet, useLocation } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { logPageView } from "../monitor/telemetry";
import { loadConfig } from "../config/loadConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "./root.css";
import RootLayout from "./layouts/root";
import { AuthProvider } from "./providers/AuthProvider";
import { msalInstance } from "../auth/msalInstance";

export default function App() {
  const location = useLocation();
  useEffect(() => {
    try {
      logPageView(location.pathname);
    } catch {}
  }, [location.pathname]);

  return (
    <AuthProvider msalInstance={msalInstance}>
      <Outlet />
    </AuthProvider>
  );
}

export const Layout = RootLayout;

export function ErrorBoundary({ error }: { error: unknown }) {
  console.error("ErrorBoundary caught an error:", error);
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const message = is404 ? "404" : "Error";
  const details = is404 ? "The requested page could not be found." : isRouteErrorResponse(error) ? error.statusText : "An unexpected error occurred.";
  return (
    <main id="error-page" style={{ textAlign: "center", padding: "2rem", width: "100vw" }}>
      <h1>{message}</h1>
      <p>{details}</p>
    </main>
  );
}

// export function HydrateFallback() {
//   return (
//     <div id="loading-splash">
//       <div id="loading-splash-spinner" />
//       <p>Loading, please wait...</p>
//     </div>
//   );
// }

// export async function clientLoader({ request }: LoaderFunctionArgs) {
//   await loadConfig();
//   return null;
// }
