/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { EditNote as EditNoteIcon, EmojiEvents as EmojiEventsIcon, Shield as ShieldIcon } from "@mui/icons-material";
import { Grid, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import QuestTierCard from "../components/QuestTierCard";
import { useAuthState } from "../providers/AuthProvider";

const questTiers = [
  {
    title: "Quest 3 Tier",
    description: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.",
    tierLabel: "3 Tier",
    tierColor: "#1976d2",
    icon: <ShieldIcon />,
    updatedAgo: "Updated 2h ago",
    href: "/quest3Tier",
  },
  {
    title: "Quest 5 Tier",
    description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
    tierLabel: "5 Tier",
    tierColor: "#2e7d32",
    icon: <EditNoteIcon />,
    updatedAgo: "Updated 5h ago",
    href: "/quest5Tier",
  },
  {
    title: "Quest 5 Tier EG",
    description: "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    tierLabel: "5 Tier EG",
    tierColor: "#6a1b9a",
    icon: <EmojiEventsIcon />,
    updatedAgo: "Updated 1d ago",
    href: "/quest5TierEg",
  },
];

export async function clientLoader() {
  const isAuthenticated = localStorage.getItem("token") && localStorage.getItem("token") !== "" ? true : false;
  return { isAuthenticated };
}

export default function HomePage() {
  const { profile } = useAuthState();
  const userName = profile?.name ?? "User";

  return (
    <>
      <Helmet>
        <title>Portal - Home</title>
      </Helmet>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Welcome to the Portal
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select a quest tier module to get started, or browse all available modules below.
      </Typography>

      <Grid container spacing={3}>
        {questTiers.map((tier) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tier.href}>
            <QuestTierCard {...tier} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
