/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { PublicClientApplication } from "@azure/msal-browser";
// TODO: Hardcoded config for now, can be moved to env or separate config file later
// import { msalConfig } from "./authConfig";

const clientId = ""; // Azure AD app registration client ID
const tenantId = ""; // Use "common" for multi-tenant applications, or specify your tenant ID
const currentHost = typeof window !== "undefined" ? window.location.origin : "";
const msalConfig = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`, //use common for multi-tenant app
    redirectUri: currentHost, // import.meta.env.MODE === "development" ? "http://localhost:5173" : "https://www.prod.z3nm3.com",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};
export const msalInstance = new PublicClientApplication(msalConfig);
