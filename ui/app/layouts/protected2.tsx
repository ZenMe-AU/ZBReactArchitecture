/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Box, Toolbar } from "@mui/material";
import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import Navbar from "../components/Navbar";
import PortalBreadcrumbs from "../components/PortalBreadcrumbs";
import Sidebar, { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from "../components/Sidebar";
import { useAuthState } from "../providers/AuthProvider";

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

const SEGMENT_LABELS: Record<string, string> = {
  quest3Tier: "Quest 3 Tier",
  quest5Tier: "Quest 5 Tier",
  quest5TierEg: "Quest 5 Tier EG",
  add: "Add",
  edit: "Edit",
  answer: "Answer",
  followUp: "Follow Up",
  share: "Share",
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  const items: { label: string; href?: string }[] = [{ label: "Home", href: "/" }];
  segments.forEach((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = SEGMENT_LABELS[seg] ?? seg;
    items.push({ label, href: i < segments.length - 1 ? href : undefined });
  });

  return items;
}

export default function Layout() {
  const { profile, isAuthenticated, isAuthReady } = useAuthState();
  const location = useLocation();
  const breadcrumbs = useBreadcrumbs();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthReady) {
    return;
  }
  if (!isAuthenticated) {
    if (location.pathname !== "/logout") {
      sessionStorage.setItem("postLoginRedirect", location.pathname + location.search);
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} />
      <Navbar loaderData={{ profile }} onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}px)`,
          bgcolor: "#f5f5f5",
          transition: (theme) => theme.transitions.create("width", { duration: theme.transitions.duration.standard }),
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <PortalBreadcrumbs items={breadcrumbs} />
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
