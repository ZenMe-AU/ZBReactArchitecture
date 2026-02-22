/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Scripts, ScrollRestoration } from "react-router";

export default function Layout({ children }: { children: React.ReactNode }) {
  // TODO: Review redirect options for frontdoor
  // const redirectScript = [
  //   '(function(){',
  //   ' try {',
  //   '   function doRedirect(targetHost){',
  //   '     try {',
  //   '       if(!targetHost) return;',
  //   '       var h = window.location.hostname || "";',
  //   '       var isStatic = /\\.web\\.core\\.windows\\.net$/i.test(h);',
  //   '       if(isStatic && h.toLowerCase() !== String(targetHost).toLowerCase()){',
  //   '         var dest = "https://" + targetHost + window.location.pathname + window.location.search + window.location.hash;',
  //   '         window.location.replace(dest);',
  //   '       }',
  //   '     } catch(e){}',
  //   '   }',
  //   '   var host = (window.__env && window.__env.FRONTEND_CUSTOM_DOMAIN_HOST) || null;',
  //   '   if(host){ doRedirect(host); } else {',
  //   '     fetch("/env.json", { cache: "no-store" })',
  //   '       .then(function(r){ return r && r.ok ? r.json() : null; })',
  //   '       .then(function(cfg){ if(cfg && cfg.FRONTEND_CUSTOM_DOMAIN_HOST){ window.__env = cfg; doRedirect(cfg.FRONTEND_CUSTOM_DOMAIN_HOST); } })',
  //   '       .catch(function(){});',
  //   '   }',
  //   ' } catch(e){}',
  //   '})();'
  // ].join("\n");
  // {/* <script dangerouslySetInnerHTML={{ __html: redirectScript }} /> */}

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
