import { useEffect } from "react";
import { Form, Scripts, ScrollRestoration, isRouteErrorResponse, Outlet, useLocation } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { logPageView } from "../monitor/telemetry";
import type { Route } from "./+types/root";
import appStylesHref from "./app.css?url";
import bootstrapHref from "bootstrap/dist/css/bootstrap.min.css?url";
import "bootstrap/dist/css/bootstrap.min.css";

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
  // const location = useLocation();

  // useEffect(() => {
  //   console.log("location:", location);
  //   console.log("document.title:", document);
  //   console.log("document.title:", document.title);

  //   // logPageView(location.pathname);
  // }, [location]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="stylesheet" href={appStylesHref} /> */}
        {/* <link rel="stylesheet" href={bootstrapHref} /> */}
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

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
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

// export function clientLoader({ request }: LoaderFunctionArgs) {
//   const url = new URL(request.url);
//   // const location = useLocation();

//   // logPageView(url.pathname, url.search);
//   // logEvent("pageView", { pathname: url.pathname });
//   // console.log("location:", location.pathname);
//   // console.log("url.pathname:", url.pathname);
//   console.log("url:", url);
//   return null;
// }
