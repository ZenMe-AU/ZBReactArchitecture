/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Navbar from "../components/Navbar";
import { useAuthState } from "../providers/AuthProvider";
import { useNavigate } from "react-router";

// export async function clientLoader() {
//   const accounts: AccountInfo[] = msalInstance.getAllAccounts();
//   const account = accounts[0];
//   if (!account) {
//     console.log("No account found, redirecting to login");
//     // return;
//     return redirect("/login");
//   }
//   console.log("Account found:");
//   console.log("Account found:", account);
//   return { profile: { name: account.idTokenClaims?.preferred_username, id: account.idTokenClaims?.oid, avatar: "" } };
//   return { profile: { name: "", id: "", avatar: "" } };
// }

export default function Layout() {
  const { account, isAuthenticated, isAuthReady } = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!isAuthenticated) {
      if (location.pathname !== "/logout") sessionStorage.setItem("postLoginRedirect", location.pathname + location.search);
      // Redirect to login
      navigate("/login", { replace: true });
    }
  }, [isAuthReady, isAuthenticated, navigate]);

  return (
    <div style={{ width: "100vw" }}>
      <Navbar
        loaderData={{
          profile: {
            name: account?.idTokenClaims?.preferred_username,
            id: account?.idTokenClaims?.oid,
            avatar: "",
            role: (account?.idTokenClaims?.roles ?? []).join(","),
          },
        }}
      />
      <Outlet />
    </div>
  );
}
