/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { PublicClientApplication } from "@azure/msal-browser";
// TODO: Hardcoded config for now, can be moved to env or separate config file later
// import { msalConfig } from "./authConfig";
const msalConfig = {
  auth: {
    clientId: "83d65e94-41f8-460a-943a-edee7d9e096b",
    authority: `https://login.microsoftonline.com/15fb0613-7977-4551-801b-6aadac824241`, //use common for multi-tenant app
    redirectUri: import.meta.env.MODE === "development" ? "http://localhost:5173" : "https://www.prod.z3nm3.com/login",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};
export const msalInstance = new PublicClientApplication(msalConfig);
