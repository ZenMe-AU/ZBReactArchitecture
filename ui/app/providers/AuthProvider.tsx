/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import type { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Profile } from "types/interfaces";
import { useRefreshDomainCookie } from "../hooks/useRefreshDomainCookie";

/**
 * Represents which login method was used.
 * - "SSO": Silent SSO login (main domain account)
 * - "OTHER": User explicitly selected another Microsoft account
 * - null: Not logged in
 */
type AuthMode = "SSO" | "OTHER" | null;

/**
 * Shape of the authentication context exposed to the app.
 */
export interface AuthContextType {
  account: AccountInfo | null;
  profile: Profile;
  mode: AuthMode;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  instance: IPublicClientApplication;
  loginWithSSO: (loginHint?: string) => Promise<void>;
  loginWithOther: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * React context for authentication state.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  msalInstance: IPublicClientApplication;
}

/**
 * Inner provider component.
 *
 * This component must be rendered inside <MsalProvider>,
 * so that we can safely use the useMsal() hook.
 */
function AuthProviderInner({ children }: { children: ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();

  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [mode, setMode] = useState<AuthMode>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  // Ensure the domain cookie is fresh on app load
  useRefreshDomainCookie();

  const profile: Profile = {
    name: account?.idTokenClaims?.preferred_username ?? "",
    id: account?.idTokenClaims?.oid ?? "",
    avatar: "",
    role: (account?.idTokenClaims?.roles ?? []).join(","),
  };

  /**
   * Synchronize MSAL accounts with local React state.
   *
   * msal-react automatically:
   * - handles redirect responses
   * - updates accounts after login/logout
   *
   * We simply mirror the first account into our context state.
   */
  useEffect(() => {
    if (inProgress !== "none") return; // Wait until MSAL is done initializing or processing a login/logout
    setAccount(accounts[0] ?? null);
    setIsAuthReady(true);
    setMode(null);

    localStorage.setItem("token", accounts[0]?.idToken || "");
    localStorage.setItem("profileId", accounts[0]?.idTokenClaims?.oid || "");
    localStorage.setItem("preferred_username", accounts[0]?.idTokenClaims?.preferred_username || "");
  }, [accounts, inProgress]);

  /**
   * Attempt silent SSO login using a known login hint.
   *
   * If silent login fails (e.g. first login, consent required),
   * fallback to redirect login.
   */
  const loginWithSSO = async (loginHint?: string) => {
    try {
      await instance.ssoSilent({
        scopes: ["openid", "profile", "email"],
        loginHint,
      });

      setMode("SSO");
    } catch {
      setMode("SSO");
      // Silent login failed → fallback to interactive login
      await instance.loginRedirect({
        scopes: ["openid", "profile", "email"],
        loginHint,
      });
    }
  };

  /**
   * Login using a different Microsoft account.
   *
   * Forces account selection UI.
   */
  const loginWithOther = async () => {
    await instance.loginRedirect({
      scopes: ["openid", "profile", "email"],
      prompt: "select_account",
    });

    setMode("OTHER");
  };

  /**
   * Logout current user and clear session.
   */
  const logout = async () => {
    // const caches = instance.getTokenCache();
    // caches.storage.clear(); // Clear MSAL cache to remove any residual tokens or accounts
    // msalInstance.logoutRedirect();
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("msal.")) {
        localStorage.removeItem(key);
      }
    });
    // await instance.logout({
    //   account: instance.getActiveAccount() ?? undefined,
    //   logoutHint: instance.getActiveAccount()?.username,
    // });
    // instance.setActiveAccount(null);
    setAccount(null);
    setMode(null);
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        profile,
        mode,
        isAuthenticated: !!account,
        isAuthReady,
        instance,
        loginWithSSO,
        loginWithOther,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Root AuthProvider.
 *
 * Wraps the application with MsalProvider first,
 * then provides custom authentication context.
 */
export function AuthProvider({ children, msalInstance }: AuthProviderProps) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </MsalProvider>
  );
}

/**
 * Custom hook to access authentication state safely.
 */
export function useAuthState() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthState must be used within AuthProvider");
  }
  return context;
}
