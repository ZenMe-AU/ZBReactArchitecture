/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Typography } from "@mui/material";
import { Helmet } from "react-helmet";

// export async function clientLoader() {
// }

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Portal - Home</title>
      </Helmet>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Welcome to the Portal
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Select an available Portal feature to get started.
      </Typography>
    </>
  );
}
