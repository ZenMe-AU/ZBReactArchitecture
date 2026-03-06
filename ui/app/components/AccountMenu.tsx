/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { PersonAddOutlined as PersonAddIcon } from "@mui/icons-material";
import { Avatar, Box, Divider, Link, ListItemIcon, ListItemText, MenuItem, Popover, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import type { Profile } from "types/interfaces";
import { useAuthState } from "../providers/AuthProvider";
import { getInitials } from "../utils/getInitials";

interface AccountMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  profile: Profile;
}

export default function AccountMenu({ anchorEl, onClose, profile }: AccountMenuProps) {
  const { loginWithOther } = useAuthState();
  const navigate = useNavigate();

  const userName = profile?.name ?? "User";

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{ paper: { sx: { width: 320, mt: 1, borderRadius: 2 } } }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, pt: 2, pb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Zenme
        </Typography>
        <Link
          component="button"
          variant="body2"
          underline="hover"
          onClick={() => {
            onClose();
            navigate("/logout");
          }}
        >
          Sign out
        </Link>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, py: 2 }}>
        <Avatar src={profile?.avatar ?? undefined} sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: 22 }}>
          {getInitials(profile?.name)}
        </Avatar>
        <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
          {userName}
        </Typography>
      </Box>

      <Divider />

      <MenuItem
        onClick={() => {
          onClose();
          loginWithOther();
        }}
        sx={{ py: 1.5 }}
      >
        <ListItemIcon>
          <PersonAddIcon />
        </ListItemIcon>
        <ListItemText primary="Sign in with a different account" />
      </MenuItem>
    </Popover>
  );
}
