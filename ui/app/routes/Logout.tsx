/**
 * @license SPDX-FileCopyrightText: © 2025 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import { redirect } from "react-router";

export const clientLoader = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("profileId");
  return redirect("/login");
};

export default function Logout() {
  return null;
}
