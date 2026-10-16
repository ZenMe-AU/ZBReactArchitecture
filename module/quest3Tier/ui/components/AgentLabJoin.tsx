/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Alert, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getMyProfileId } from "../api/profile";

const LAB_URL = "http://127.0.0.1:4178";

export function AgentLabJoin() {
  const [available, setAvailable] = useState(false);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const check = () => {
      fetch(`${LAB_URL}/api/run`, { cache: "no-store" })
        .then(async (response) => response.ok ? response.json() : null)
        .then((run) => {
          if (active) setAvailable(run?.status === "waiting-for-human");
        })
        .catch(() => {
          if (active) setAvailable(false);
        });
    };
    check();
    const interval = window.setInterval(check, 2_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!available && !message) return null;

  const join = async () => {
    setJoining(true);
    setMessage("");
    try {
      const profileId = await getMyProfileId();
      const response = await fetch(`${LAB_URL}/api/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not join the active Agent Lab test");
      setAvailable(false);
      setMessage("Joined Agent Lab. The agents are now running; share questions with them as usual.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setJoining(false);
    }
  };

  return (
    <Alert severity={message ? "info" : "warning"} sx={{ mb: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between">
        <Typography variant="body2">{message || "An Agent Lab test is waiting for one Q3 participant."}</Typography>
        {available ? (
          <Button variant="contained" size="small" startIcon={joining ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />} disabled={joining} onClick={join}>
            {joining ? "Joining..." : "Join test"}
          </Button>
        ) : null}
      </Stack>
    </Alert>
  );
}
