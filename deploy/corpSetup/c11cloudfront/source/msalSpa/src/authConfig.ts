import { type Configuration } from "@azure/msal-browser";

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: "b0ee1412-c79a-48f3-978e-f61f740d7832",
    authority: "https://login.microsoftonline.com/15fb0613-7977-4551-801b-6aadac824241", //use common for multi-tenant app
    redirectUri: "https://login.zenblox.com.au", // Must match Azure App Registration
    // redirectUri: "http://localhost:3000", // Must match Azure App Registration
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
