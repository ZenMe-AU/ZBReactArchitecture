/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { Outlet, redirect } from "react-router";
import { authVerify } from "../../api/auth";
import Navbar from "../components/Navbar";
import type { Route } from "./+types/protected";

export async function clientLoader() {
  const token = localStorage.getItem("token");
  if (!token) {
    return redirect("/login");
  }
  try {
    const profile = await authVerify();
    return { profile };
  } catch (error) {
    console.error("Auth verify failed:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("profileId");
    return redirect("/login");
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <div
      style={{
        width: "100vw",
      }}
    >
      <Navbar loaderData={loaderData} />
      <Outlet />
    </div>
  );
}
