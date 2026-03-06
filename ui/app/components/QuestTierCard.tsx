/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Box, Card, CardActionArea, CardContent, Chip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link } from "react-router";

interface QuestTierCardProps {
  title: string;
  description: string;
  tierLabel: string;
  tierColor: string;
  icon: ReactNode;
  updatedAgo?: string;
  href: string;
}

export default function QuestTierCard({ title, description, tierLabel, tierColor, icon, updatedAgo, href }: QuestTierCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderTop: `3px solid ${tierColor}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      <CardActionArea component={Link} to={href} sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <CardContent sx={{ flexGrow: 1, width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                bgcolor: tierColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              {icon}
            </Box>
            <Chip label={tierLabel} size="small" variant="outlined" sx={{ borderColor: tierColor, color: tierColor, fontWeight: 600 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            width: "100%",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {updatedAgo ?? ""}
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}
