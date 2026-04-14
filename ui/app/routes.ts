/**
 * @license SPDX-FileCopyrightText: © 2026 Zenme Pty Ltd <info@zenme.com.au>
 * @license SPDX-License-Identifier: MIT
 */

import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";
import { protectedRoutes as profileProtectedRoutes, publicRoutes as profilePublicRoutes } from "../../module/profile/ui/routes";
// console.log("Question Routes:", questionRoutes);
// const modules = import.meta.glob("../../module/question/ui/routes.ts", { eager: true });

// let routes: any[] = [];

// for (const path in modules) {
//   const mod = modules[path];
//   const defaultExport = mod.default ?? [];
//   console.log("Module Routes:", path, defaultExport);
// }

// console.log("Modules Routes:", modules);
export default [
  route("login", "./routes/Login2.tsx"),
  ...profilePublicRoutes,
  layout("./layouts/protected2.tsx", [
    index("./routes/HomePage.tsx"),
    route("logout", "./routes/Logout2.tsx"),
    ...profileProtectedRoutes,
    route("quest3Tier/*", "./routes/remotes/Quest3TierRemote.tsx"),
    route("quest5Tier/*", "./routes/remotes/Quest5TierRemote.tsx"),
    route("quest5TierEg/*", "./routes/remotes/Quest5TierEgRemote.tsx"),
  ]),
] satisfies RouteConfig;
