/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import type { AccountInfo, IPublicClientApplication, AuthenticationResult } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Profile } from "types/interfaces";
import { useRefreshDomainCookie } from "../hooks/useRefreshDomainCookie";

const scopes = ["openid", "profile", "email", "User.Read"];
/**
 * --DEPRECATED--
 * Represents which login method was used.
 * - "SSO": Silent SSO login (main domain account)
 * - "OTHER": User explicitly selected another Microsoft account
 * - null: Not logged in
 */
// type AuthMode = "SSO" | "OTHER" | null;

/**
 * Shape of the authentication context exposed to the app.
 */
export interface AuthContextType {
  account: AccountInfo | null;
  accounts: AccountInfo[];
  profile: Profile;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  instance: IPublicClientApplication;
  loginWithSSO: (loginHint?: string) => Promise<void>;
  loginWithOther: () => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: (acc: AccountInfo) => Promise<void>;
  forgetAccount: (acc: AccountInfo) => Promise<void>;
  forgetAllAccounts: () => Promise<void>;
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
  const [photos, setPhotos] = useState<Record<string, string>>({});
  // Ensure the domain cookie is fresh on app load
  useRefreshDomainCookie();

  const profile: Profile = {
    homeAccountId: account?.homeAccountId ?? "",
    name: account?.idTokenClaims?.preferred_username ?? "",
    id: account?.idTokenClaims?.oid ?? "",
    avatar: photos[account?.homeAccountId ?? ""] ?? "",
    role: (account?.idTokenClaims?.roles ?? []).join(","),
  };

  const initAuth = useCallback(async () => {
    if (inProgress !== "none") return;
    const active = instance.getActiveAccount();
    // automatically set active account if only one is present
    // if (!active && accounts.length === 1) {
    //   active = accounts[0];
    //   instance.setActiveAccount(active);
    // }
    if (active) {
      const tokenRes = await instance.acquireTokenSilent({
        scopes: ["User.Read"],
        account: active,
      });
      setAccount(active);
      syncTokenToLocalStorage(tokenRes);
      return;
    }

    // fallback: ssoSilent if we have a previous login hint (homeAccountId) stored in localStorage
    // const homeAccId = localStorage.getItem("account_id");
    // if (homeAccId) {
    //   try {
    //     const tokenRes = await instance.ssoSilent({
    //       scopes: ["User.Read"],
    //       loginHint: homeAccId,
    //     });
    //     if (tokenRes?.account) {
    //       instance.setActiveAccount(tokenRes.account);
    //       setAccount(tokenRes.account);
    //       syncTokenToLocalStorage(tokenRes);
    //     }
    //   } catch (err) {
    //     console.warn("ssoSilent failed", err);
    //   }
    //   return;
    // }

    // fallback: handle redirect promise
    const res = await instance.handleRedirectPromise();
    if (res?.account) {
      instance.setActiveAccount(res.account);
      setAccount(res.account);
      syncTokenToLocalStorage(res);
    }
  }, [inProgress, accounts, instance]);

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
    initAuth();
  }, [initAuth]);

  /**
   * Helper to sync token and profile info to localStorage for API calls.
   * Clears localStorage on logout.
   */
  const syncTokenToLocalStorage = async (res?: AuthenticationResult) => {
    console.log("syncTokenToLocalStorage called with res:", res);
    if (res) {
      localStorage.setItem("token", res.accessToken || "");
      localStorage.setItem("profileId", res.idTokenClaims?.oid || "");
      localStorage.setItem("preferred_username", res.idTokenClaims?.preferred_username || "");
      localStorage.setItem("account_id", res.account?.homeAccountId ?? "");
      fetchPhotoForAccount(res);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("profileId");
      localStorage.removeItem("preferred_username");
      localStorage.removeItem("account_id");
    }
  };

  /**
   * Fetch user photo from Microsoft Graph API and cache it in state.
   * Uses the access token from authentication result for authorization.
   * Caches photos by account ID to avoid redundant fetches.
   */
  const fetchPhotoForAccount = async (res?: AuthenticationResult) => {
    if (!res) return;
    const id = res.account.homeAccountId;
    if (!id || photos[id]) return; // if no account ID or photo already set, skip fetch
    try {
      const tokenRes = res.accessToken
        ? res
        : await instance.acquireTokenSilent({
            account: res.account,
            scopes: ["User.Read"],
          });
      // Use Microsoft Graph API to fetch user photo, 48x48 size for avatar
      const r = await fetch("https://graph.microsoft.com/v1.0/me/photos/48x48/$value", {
        headers: { Authorization: `Bearer ${tokenRes.accessToken}` },
      });
      let url = null;
      if (r.ok) {
        const blob = await r.blob();
        url = URL.createObjectURL(blob);
      }
      setPhotos((prev) => ({ ...prev, [id]: url || "" })); // if no photo, set empty string to avoid refetching
    } catch (err) {
      console.warn("Failed to fetch photo", err);
    }
  };

  /**
   * Attempt silent SSO login using a known login hint.
   *
   * If silent login fails (e.g. first login, consent required),
   * fallback to redirect login.
   */
  const loginWithSSO = async (loginHint?: string) => {
    try {
      const res = await instance.ssoSilent({
        scopes,
        loginHint,
      });
      console.log("Silent SSO login successful:", res);
      instance.setActiveAccount(res.account);
      syncTokenToLocalStorage(res);
    } catch {
      // Silent login failed -> fallback to interactive login
      await instance.loginRedirect({
        scopes,
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
      scopes,
      prompt: "select_account",
    });
  };

  /**
   * Logout current user and clear session.
   */
  const logout = async () => {
    // instance.logout({
    //   account,
    //   logoutHint: account?.idTokenClaims?.preferred_username ?? undefined,
    // });
    instance.setActiveAccount(null);
    setAccount(null);
    syncTokenToLocalStorage();
  };

  /**
   * Helper to switch active account (if multiple accounts are present).
   */
  const switchAccount = async (acc: AccountInfo) => {
    instance.setActiveAccount(acc);
    const tokenRes = await instance.acquireTokenSilent({
      scopes: ["User.Read"],
      account: acc,
    });
    setAccount(tokenRes.account);
    syncTokenToLocalStorage(tokenRes);
  };

  /**
   * Helper to forget a specific account and its tokens from MSAL cache.
   * Useful for "Forget this account" functionality in account management.
   */
  const forgetAccount = async (account: AccountInfo) => {
    await instance.clearCache({ account });
    if (instance.getActiveAccount()?.homeAccountId === account.homeAccountId) logout(); // If the forgotten account is currently active, log out to clear session
  };

  /**
   * Clear all accounts and tokens from MSAL cache.
   * Useful for scenarios like "Forget all accounts" or "Clear session".
   */
  const forgetAllAccounts = async () => {
    await instance.clearCache(); // Clear MSAL cache to remove any residual tokens or accounts
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        accounts,
        profile,
        isAuthenticated: !!account,
        isAuthReady: inProgress === "none", //&& accounts.length > 0,
        instance,
        loginWithSSO,
        loginWithOther,
        logout,
        switchAccount,
        forgetAccount,
        forgetAllAccounts,
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
