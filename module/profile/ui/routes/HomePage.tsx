/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Helmet } from "react-helmet";
import { Link } from "react-router";

export default function HomePage({ loaderData }: { loaderData: { isAuthenticated: boolean } }) {
  return (
    <main>
      <Helmet>
        <title>HomePage</title>
      </Helmet>
      <div style={{ textAlign: "center", marginTop: "5rem", width: "100vw" }}>
        <h1>Welcome to the PRofile</h1>
        <p>This is the main entry of the profile module.</p>
      </div>
    </main>
  );
}
