/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Helmet } from "react-helmet";
import { Link } from "react-router";
import { Button, Box } from "@mui/material";

export async function clientLoader() {
  const isAuthenticated = localStorage.getItem("token") ? true : false;
  return { isAuthenticated };
}

export default function HomePage({ loaderData }: { loaderData: { isAuthenticated: boolean } }) {
  const { isAuthenticated } = loaderData;
  return (
    <main>
      <Helmet>
        <title>HomePage</title>
      </Helmet>
      <div style={{ textAlign: "center", marginTop: "5rem", width: "100vw" }}>
        <h1>Welcome to the Portal</h1>
        <p>This is the main entry of the application.</p>
        {isAuthenticated && (
          <>
            <p>You are logged in.</p>
          </>
        )}
        <Box
          sx={{
            // height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: 200,
            }}
          >
            <Button component={Link} to="/quest3Tier" variant="contained">
              Question
            </Button>
            <Button component={Link} to="/quest5Tier" variant="contained">
              Question V3
            </Button>
          </Box>
        </Box>
      </div>
    </main>
  );
}
