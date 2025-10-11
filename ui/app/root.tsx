import { useEffect } from "react";
import { Form, Scripts, ScrollRestoration, isRouteErrorResponse, Outlet, useLocation, useMatches } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { Helmet } from "react-helmet";
import { logPageView } from "../monitor/telemetry";
import type { Route } from "./+types/root";
import appStylesHref from "./app.css?url";
import bootstrapHref from "bootstrap/dist/css/bootstrap.min.css?url";
import "bootstrap/dist/css/bootstrap.min.css";
import { loadConfig, getConfig } from "../config/loadConfig";

export default function App() {
  return (
    <div
    // style={{
    //   display: "flex",
    //   minHeight: "100vh",
    //   width: "100vw",
    //   justifyContent: "center",
    //   alignItems: "center",
    // }}
    >
      <Outlet />
    </div>
  );
}

// The Layout component is a special export for the root route.
// It acts as your document's "app shell" for all route components, HydrateFallback, and ErrorBoundary
// For more information, see https://reactrouter.com/explanation/special-files#layout-export
export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const matches = useMatches();
  // const handle = [...matches].reverse().find((match) => match.handle)?.handle;

  useEffect(() => {
    console.log("location:", location);
    console.log("matches:", matches);
    // console.log("handle:", handle);
    console.log("document.title:", document);
    console.log("document.title:", document.title);

    logPageView(location.pathname);
  }, [location]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="stylesheet" href={appStylesHref} /> */}
        {/* <link rel="stylesheet" href={bootstrapHref} /> */}
        {/* Client-side redirect: if users hit the static website origin directly, redirect to Front Door custom domain */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var targetHost = 'constitutionalegret.zenblox.com.au';
                  var h = window.location.hostname || '';
                  var isStaticWebsite = /\.web\.core\.windows\.net$/i.test(h);
                  if (isStaticWebsite && h.toLowerCase() !== targetHost.toLowerCase()) {
                    var dest = 'https://' + targetHost + window.location.pathname + window.location.search + window.location.hash;
                    window.location.replace(dest);
                  }
                } catch (e) { /* noop */ }
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// The top most error boundary for the app, rendered when your app throws an error
// For more information, see https://reactrouter.com/start/framework/route-module#errorboundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  let isDev = getConfig("DEV") || false;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (isDev && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main id="error-page" style={{ textAlign: "center", padding: "2rem", width: "100vw" }}>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
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
  //   const url = new URL(request.url);
  //   // const location = useLocation();
  //   // logPageView(url.pathname, url.search);
  //   // logEvent("pageView", { pathname: url.pathname });
  //   // console.log("location:", location.pathname);
  //   // console.log("url.pathname:", url.pathname);
  //   console.log("url:", url);
  //   return null;
}
