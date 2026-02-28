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

export async function clientLoader() {
  const idTokenCookie = await cookieStore.get("idToken");
  let preferred_username: string | undefined;

  try {
    if (idTokenCookie?.value) {
      const payloadBase64 = idTokenCookie.value.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      preferred_username = payload.preferred_username ?? undefined;
    }
  } catch (err) {
    console.error("Failed to decode token", err);
  }

  return {
    preferred_username,
  };
}

export default function Login({ loaderData }: { loaderData: { preferred_username?: string } }) {
  const { preferred_username } = loaderData;
  const navigate = useNavigate();
  const { account, isAuthReady, loginWithSSO, loginWithOther } = useAuthState();
  const { isReady } = useRefreshDomainCookie();
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
            {/* <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Sign in
          </Typography> */}
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              sx={{
                width: "100%",
                borderRadius: 25,
                textTransform: "none",
                fontWeight: "bold",
              }}
              onClick={() => loginWithSSO(preferred_username)}
              disabled={!preferred_username}
            >
              Continue with {preferred_username ?? "SSO"}
            </Button>

            {/* <Divider sx={{ my: 3 }}>or</Divider> */}
            <Box sx={{ my: 3 }}></Box>
            <Button
              variant="outlined"
              size="large"
              startIcon={<SwitchAccountIcon />}
              sx={{
                width: "100%",
                borderRadius: 25,
                textTransform: "none",
                fontWeight: "bold",
                borderWidth: 2,
              }}
              onClick={loginWithOther}
            >
              Use Another Microsoft Account
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
