/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { useNavigate } from "react-router";
import { AppBar, Toolbar, Typography, Avatar, Button, Box } from "@mui/material";
import { logEvent } from "../../monitor/telemetry";

export default function Navbar({ loaderData }: { loaderData: { profile: { id: string; name?: string; avatar?: string } } }) {
  const { profile } = loaderData;
  const navigate = useNavigate();

  const handleLogout = () => {
    // logEvent("btnLogoutClick", {
    //   parentId: "Navbar",
    // });
    navigate("/logout");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          {profile?.avatar && <Avatar src={profile.avatar} alt={profile.name} sx={{ mr: 2 }} />}
          <Typography variant="h6" component="div">
            {profile?.id} {profile?.name || "Unknown User"}
          </Typography>
        </Box>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
