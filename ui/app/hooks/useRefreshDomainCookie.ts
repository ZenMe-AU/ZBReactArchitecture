/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { useState, useEffect, useRef, useCallback } from "react";
// TODO: Hardcoded main domain URL, consider making it configurable via env variable if we have more domains in the future
const mainDomainUrl = import.meta.env.MODE === "development" ? "http://localhost:3000/" : "https://login.z3nm3.com/";
const cookieName = "idToken";
/**
 * Hook to silently refresh domain cookie from main domain via iframe.
 */
export function useRefreshDomainCookie() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [cookieValue, setCookieValue] = useState<string | null>(null);
  const refreshingRef = useRef(false);

  const checkAndRefresh = useCallback(async () => {
    if (refreshingRef.current) {
      //   console.log("Refresh already in progress, skipping...");
      return;
    }

    refreshingRef.current = true;
    setIsRefreshing(true);
    setIsReady(false);
    try {
      const cookie = await cookieStore.get(cookieName);
      if (!cookie || !cookie.value) {
        console.log("Domain cookie missing, refreshing via iframe.");
        await new Promise<void>((resolve, reject) => {
          const iframe = document.createElement("iframe");
          iframe.src = mainDomainUrl;
          iframe.style.display = "none";

          const handler = (event: MessageEvent) => {
            if (event.origin !== new URL(mainDomainUrl).origin) return;

            if (event.data?.authStatus === "SUCCESS") {
              window.removeEventListener("message", handler);
              document.body.removeChild(iframe);
              resolve();
            } else if (event.data?.authStatus === "FAILED") {
              window.removeEventListener("message", handler);
              document.body.removeChild(iframe);
              reject(new Error(`Domain cookie refresh failed: ${mainDomainUrl}`));
            }
          };

          window.addEventListener("message", handler);
          document.body.appendChild(iframe);

          setTimeout(() => {
            window.removeEventListener("message", handler);
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            reject(new Error("Domain cookie refresh timeout"));
          }, 10000);
        });

        console.log("Domain cookie refreshed successfully");
        const refreshed = await cookieStore.get(cookieName);
        setCookieValue(refreshed?.value ?? null);
      } else {
        console.log("Domain cookie exists, no refresh needed");
        setCookieValue(cookie.value);
      }
    } catch (err) {
      console.error("Failed to refresh domain cookie:", err);
      setCookieValue(null);
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    checkAndRefresh();
  }, [checkAndRefresh]);

  return { isRefreshing, isReady, cookieValue, checkAndRefresh };
}
