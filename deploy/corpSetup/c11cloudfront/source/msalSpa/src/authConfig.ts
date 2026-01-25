import { type Configuration } from "@azure/msal-browser";
const cfg =
  window.__APP_CONFIG__ ||
  (() => {
    if (import.meta.env.MODE === "development") {
      // dev fallback
      return {
        clientId: "b0ee1412-c79a-48f3-978e-f61f740d7832",
        redirectUri: "http://localhost:3000",
      };
    }
    // production fallback
    return null;
  })();

if (!cfg) {
  throw new Error("config.js not loaded");
}

console.log("Local config:", cfg);

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    // clientId: "b0ee1412-c79a-48f3-978e-f61f740d7832",
    clientId: cfg.clientId,
    authority: "https://login.microsoftonline.com/15fb0613-7977-4551-801b-6aadac824241", //use common for multi-tenant app
    // redirectUri: "https://login.zenblox.com.au", // Must match Azure App Registration
    redirectUri: cfg.redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage", // easier for local dev
    storeAuthStateInCookie: false,
  },
};

// Login request scopes
export const loginRequest = {
  // scopes: ["User.Read"],
  scopes: ["openid", "profile", "email"],
};
