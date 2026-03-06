/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet";
import { Box, Card, CardContent, Typography, Button, Divider } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import { useAuthState } from "../providers/AuthProvider";
import { useRefreshDomainCookie } from "../hooks/useRefreshDomainCookie";
import { useRevalidator } from "react-router";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CircularProgress from "@mui/material/CircularProgress";
export async function clientLoader() {
  const idTokenCookie = await cookieStore.get("idToken");
  let preferred_username: string | undefined;
  let name: string | undefined;

  try {
    if (idTokenCookie?.value) {
      const payloadBase64 = idTokenCookie.value.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      preferred_username = payload.preferred_username ?? undefined;
      name = payload.name ?? undefined;
    }
  } catch (err) {
    console.error("Failed to decode token", err);
  }

  return {
    preferred_username,
    name,
  };
}

export default function Login({ loaderData }: { loaderData: { preferred_username?: string; name?: string } }) {
  console.log("Login loaderData:", loaderData);
  const { preferred_username, name } = loaderData;
  const navigate = useNavigate();
  const { account, isAuthReady, loginWithSSO, loginWithOther } = useAuthState();
  const { isReady, isRefreshing } = useRefreshDomainCookie();
  const { revalidate } = useRevalidator();

  useEffect(() => {
    if (account) {
      const postLoginRedirect = sessionStorage.getItem("postLoginRedirect") ?? null;
      const isSafeRedirect =
        postLoginRedirect &&
        postLoginRedirect.startsWith("/") &&
        !postLoginRedirect.startsWith("//") &&
        !postLoginRedirect.startsWith("/logout") &&
        !postLoginRedirect.startsWith("/login");
      sessionStorage.removeItem("postLoginRedirect");
      navigate(isSafeRedirect ? postLoginRedirect : "/", { replace: true });
    }
  }, [account, navigate]);

  // Revalidate loader once the SSO cookie is ready
  useEffect(() => {
    if (!preferred_username && isReady) {
      revalidate();
    }
  }, [preferred_username, isReady, revalidate]);

  if (!isAuthReady) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to bottom right, #dedede, #ffffff)",
          px: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: "100%", borderRadius: 4, boxShadow: 12 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
              Continue with
            </Typography>

            <Box
              onClick={() => {
                if (!preferred_username || !isAuthReady) return;
                loginWithSSO(preferred_username);
              }}
              sx={{
                width: "100%",
                borderRadius: 3,
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: !preferred_username || !isAuthReady ? "not-allowed" : "pointer",
                opacity: !preferred_username ? 0.5 : 1,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: !preferred_username || !isAuthReady ? "transparent" : "rgba(0,0,0,0.06)",
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#f3f3f3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                }}
              >
                <BadgeOutlinedIcon color="action" />
              </Box>

              <Box sx={{ flexGrow: 1, textAlign: "left" }}>
                <Typography fontWeight="bold">{name || ""}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {preferred_username || "Not available"}
                </Typography>
              </Box>

              <Box sx={{ ml: 2 }}>{isRefreshing ? <CircularProgress size={20} /> : <LoginIcon color="action" />}</Box>
            </Box>
            <Box sx={{ my: 3 }}></Box>
            <Button
              variant="outlined"
              size="large"
              // startIcon={<SwitchAccountIcon />}
              sx={{
                width: "100%",
                borderRadius: 25,
                textTransform: "none",
                fontWeight: "bold",
                // borderWidth: 2,
                borderColor: "text.primary",
                color: "text.primary",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.06)",
                },
              }}
              onClick={loginWithOther}
            >
              Another Microsoft Account
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

function LoadingScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #dedede, #ffffff)",
        px: 2,
      }}
    >
      <Typography variant="h6" color="textSecondary">
        Loading authentication...
      </Typography>
    </Box>
  );
}
