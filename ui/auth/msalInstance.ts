/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { PublicClientApplication } from "@azure/msal-browser";
// TODO: Hardcoded config for now, can be moved to env or separate config file later
// import { msalConfig } from "./authConfig";
const msalConfig = {
  auth: {
    clientId: "d70d018d-1452-4958-8dc7-70dd30f59e30",
    authority: `https://login.microsoftonline.com/15fb0613-7977-4551-801b-6aadac824241`, //use common for multi-tenant app
    redirectUri: import.meta.env.MODE === "development" ? "http://localhost:5173" : "https://www.prod.z3nm3.com/login",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};
export const msalInstance = new PublicClientApplication(msalConfig);
