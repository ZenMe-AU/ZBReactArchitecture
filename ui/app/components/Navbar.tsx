/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Menu as MenuIcon, NotificationsOutlined as NotificationsIcon } from "@mui/icons-material";
import { AppBar, Avatar, Badge, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import type { Profile } from "types/interfaces";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Portal",
  "/quest3Tier": "Quest 3 Tier",
  "/quest5Tier": "Quest 5 Tier",
  "/quest5TierEg": "Quest 5 Tier EG",
};

function usePageTitle(): string {
  const { pathname } = useLocation();
  const match = Object.keys(ROUTE_TITLES)
    .filter((prefix) => (prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(prefix + "/")))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_TITLES[match] : "Portal";
}

// e.g."John Doe" -> "JD"
function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar({ loaderData, onMenuToggle }: { loaderData: { profile: Profile }; onMenuToggle?: () => void }) {
  const { profile } = loaderData;
  const navigate = useNavigate();
  const pageTitle = usePageTitle();

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: "white",
        color: "text.primary",
      }}
    >
      <Toolbar>
        <IconButton sx={{ mr: 1 }} onClick={onMenuToggle}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, flexGrow: 1 }}>
          {pageTitle}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton>
            <Badge variant="dot" color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Avatar
            src={profile?.avatar ?? undefined}
            sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14, cursor: "pointer" }}
            onClick={() => navigate("/logout")}
          >
            {getInitials(profile?.name)}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
