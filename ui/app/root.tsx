import { useEffect } from "react";
import { Scripts, ScrollRestoration, isRouteErrorResponse, Outlet, useLocation } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { logPageView } from "../monitor/telemetry";
import { loadConfig } from "../config/loadConfig";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    try {
      logPageView(location.pathname);
    } catch {}
  }, [location]);

  const redirectScript = [
    '(function(){',
    ' try {',
    '   function doRedirect(targetHost){',
    '     try {',
    '       if(!targetHost) return;',
    '       var h = window.location.hostname || "";',
    '       var isStatic = /\\.web\\.core\\.windows\\.net$/i.test(h);',
    '       if(isStatic && h.toLowerCase() !== String(targetHost).toLowerCase()){',
    '         var dest = "https://" + targetHost + window.location.pathname + window.location.search + window.location.hash;',
    '         window.location.replace(dest);',
    '       }',
    '     } catch(e){}',
    '   }',
    '   var host = (window.__env && window.__env.FRONTEND_CUSTOM_DOMAIN_HOST) || null;',
    '   if(host){ doRedirect(host); } else {',
    '     fetch("/env.json", { cache: "no-store" })',
    '       .then(function(r){ return r && r.ok ? r.json() : null; })',
    '       .then(function(cfg){ if(cfg && cfg.FRONTEND_CUSTOM_DOMAIN_HOST){ window.__env = cfg; doRedirect(cfg.FRONTEND_CUSTOM_DOMAIN_HOST); } })',
    '       .catch(function(){});',
    '   }',
    ' } catch(e){}',
    '})();'
  ].join("\n");

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: any) {
          const is404 = isRouteErrorResponse(error) && error.status === 404;
          const message = is404 ? "404" : "Error";
          const details = is404 ? "The requested page could not be found." : (isRouteErrorResponse(error) ? error.statusText : "An unexpected error occurred.");
          return (
            <main id="error-page" style={{ textAlign: "center", padding: "2rem", width: "100vw" }}>
              <h1>{message}</h1>
              <p>{details}</p>
            </main>
          );
        }

        export function HydrateFallback() {
          return (
            <div id="loading-splash">
              <div id="loading-splash-spinner" />
              <p>Loading, please wait...</p>
            </div>
          );
        }

        export async function clientLoader({ request }: LoaderFunctionArgs) {
          await loadConfig();
          return null;
        }
