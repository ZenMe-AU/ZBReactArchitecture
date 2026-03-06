/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import type { AccountInfo } from "@azure/msal-browser";
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
  const { account: activeAccount, accounts, switchAccount, loginWithOther } = useAuthState();
  const navigate = useNavigate();

  const { preferredUserName = "User", name = "User" } = profile;

  const renderAccount = (account: AccountInfo) => {
    const isActive = activeAccount?.homeAccountId === account.homeAccountId;
    const initials = getInitials(account.name ?? account.name);
    return (
      <MenuItem
        key={account.homeAccountId}
        selected={isActive}
        onClick={() => {
          switchAccount(account);
          window.location.reload();
        }}
        sx={{ py: 1, mx: 1, borderRadius: 1 }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: isActive ? "primary.main" : "grey.400" }}>{initials}</Avatar>
        </ListItemIcon>
        <ListItemText
          primary={account.name}
          secondary={account.username}
          slotProps={{
            primary: { variant: "body2", sx: { fontWeight: isActive ? 700 : 500 } },
            secondary: { variant: "caption" },
          }}
        />
      </MenuItem>
    );
  };

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
          {profile?.initials}
        </Avatar>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="body1" sx={{ wordBreak: "break-all", fontWeight: 700 }}>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            {preferredUserName}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ py: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
          Accounts
        </Typography>
        {accounts.map(renderAccount)}
        <MenuItem
          onClick={() => {
            onClose();
            loginWithOther();
          }}
          sx={{ py: 2, mx: 1, borderRadius: 1, minHeight: 48 }}
        >
          <ListItemIcon>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Choose another account" />
        </MenuItem>
      </Box>
    </Popover>
  );
}
