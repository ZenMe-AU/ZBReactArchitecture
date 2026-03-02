// import React from "react";
import { PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { msalConfig, loginRequest } from "./authConfig";

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);
const cookieDomain = "zenblox.com.au";

function AppContent() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account: AccountInfo | undefined = accounts[0];

  // Trigger login redirect
  const login = async () => {
    await instance.loginRedirect(loginRequest);
  };

  // Trigger logout redirect
  const logout = async () => {
    await cookieStore.delete("idToken");
    await cookieStore.delete("preferred_username");
    await instance.logoutRedirect();
  };

  // const hasParentToken = (await cookieStore.getAll()).some(
  //   c =>
  //     c.name === 'token' &&
  //     (c.domain === 'example.com' || c.domain === '.example.com')
  // );

  const insAccounts = instance.getAllAccounts();
  console.log("insAccounts:", insAccounts);
  if (isAuthenticated && account) {
    // Get ID token silently

    const response = async () => {
      return await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
    };
    response().then(function (res) {
      console.log(res);
      console.log(res?.idToken);
      // Set the ID token as a cookie
      if (res && res.idToken) {
        const idTokenClaims = res.idTokenClaims as { preferred_username?: string };
        // localStorage.setItem("idToken", res.idToken);
        // localStorage.setItem("preferred_username", idTokenClaims?.preferred_username || "");
        try {
          cookieStore.set({
            name: "idToken",
            value: res.idToken || "",
            domain: cookieDomain,
          });
          cookieStore.set({
            name: "preferred_username",
            value: idTokenClaims?.preferred_username || "",
            domain: cookieDomain,
          });
        } catch (error) {
          console.log(`Error setting cookie1: ${error}`);
        }
      }
    });
    console.log("account:", account);
  }

  return (
    <div style={{ padding: 24 }}>
      {!isAuthenticated && <button onClick={login}>Sign in</button>}

      {isAuthenticated && account && (
        <>
          <button onClick={logout}>Sign out</button>

          <h3>ID Token Claims</h3>
          <pre>{JSON.stringify(account.idTokenClaims, null, 2)}</pre>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AppContent />
    </MsalProvider>
  );
}

export default App;
