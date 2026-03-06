/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import {
  Assessment as AssessmentIcon,
  CalendarMonth as CalendarMonthIcon,
  Dashboard as DashboardIcon,
  EditNote as EditNoteIcon,
  EmojiEvents as EmojiEventsIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Toolbar, Typography } from "@mui/material";
import { Link, useLocation } from "react-router";

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 0;

const questTiers = [
  { label: "Quest 3 Tier ", href: "/quest3Tier", icon: <ShieldIcon />, color: "#1976d2" },
  { label: "Quest 5 Tier", href: "/quest5Tier", icon: <EditNoteIcon />, color: "#2e7d32" },
  { label: "Quest 5 Tier EG", href: "/quest5TierEg", icon: <EmojiEventsIcon />, color: "#6a1b9a" },
];

const decorationItems = [
  { label: "Dashboard", icon: <DashboardIcon /> },
  { label: "Schedule", icon: <CalendarMonthIcon /> },
];

const adminItems = [
  { label: "Team Members", icon: <PeopleIcon /> },
  { label: "Reports", icon: <AssessmentIcon /> },
  { label: "Settings", icon: <SettingsIcon /> },
];

export default function Sidebar({ open = true }: { open?: boolean }) {
  const location = useLocation();
  const isActive = (href: string) => location.pathname === href || (href !== "/" && location.pathname.startsWith(href + "/"));

  const drawerWidth = open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const navItem = (label: string, icon: React.ReactNode, props: object) => (
    <ListItem disablePadding>
      <ListItemButton {...props}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        overflow: "hidden",
        transition: (theme) => theme.transitions.create("width", { duration: theme.transitions.duration.standard }),
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          overflowX: "hidden",
          transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: (theme) => theme.transitions.create(["transform", "width"], { duration: theme.transitions.duration.standard }),
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: "hidden" }}>
        <List subheader={<ListSubheader sx={{ fontWeight: 700, fontSize: "0.7rem", letterSpacing: 1 }}>MAIN</ListSubheader>}>
          {navItem("Home", <HomeIcon />, { component: Link, to: "/", selected: location.pathname === "/" })}
          {decorationItems.map((item) => navItem(item.label, item.icon, { disabled: true }))}
        </List>

        <List subheader={<ListSubheader sx={{ fontWeight: 700, fontSize: "0.7rem", letterSpacing: 1 }}>MODULES</ListSubheader>}>
          {questTiers.map((tier) =>
            navItem(tier.label, <Box sx={{ color: tier.color, display: "flex" }}>{tier.icon}</Box>, {
              component: Link,
              to: tier.href,
              selected: isActive(tier.href),
            })
          )}
        </List>

        <List subheader={<ListSubheader sx={{ fontWeight: 700, fontSize: "0.7rem", letterSpacing: 1 }}>ADMINISTRATION</ListSubheader>}>
          {adminItems.map((item) => navItem(item.label, item.icon, { disabled: true }))}
        </List>

        <Box sx={{ position: "fixed", bottom: 16, left: 0, width: drawerWidth, px: 2, display: "flex", justifyContent: "flex-start" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SettingsIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Quest Portal v2.1.0
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
