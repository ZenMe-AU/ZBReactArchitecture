/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import { useAuthState } from "../providers/AuthProvider";

export default function Logout() {
  const { logout } = useAuthState();
  const navigate = useNavigate();
  useEffect(() => {
    logout();
    navigate("/login");
  }, []);
  // return redirect("/login");
  return "";
}
