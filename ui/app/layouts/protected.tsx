/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Box, Toolbar } from "@mui/material";
import { useState } from "react";
import { Outlet, redirect, useLocation } from "react-router";
import { authVerify } from "../../api/auth";
import Navbar from "../components/Navbar";
import PortalBreadcrumbs from "../components/PortalBreadcrumbs";
import Sidebar, { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from "../components/Sidebar";
import type { Route } from "./+types/protected";

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

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    return redirect("/login");
  }
  try {
    const profile = await authVerify();
    return { profile };
  } catch (error) {
    console.error("Auth verify failed:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("profileId");
    return redirect("/login");
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const breadcrumbs = useBreadcrumbs();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} />
      <Navbar loaderData={loaderData} onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
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
