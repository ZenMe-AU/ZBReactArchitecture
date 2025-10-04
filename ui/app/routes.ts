import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";
import { protectedRoutes as quest3TierProtectedRoutes, publicRoutes as quest3TierPublicRoutes } from "../../module/quest3Tier/ui/routes";
import { protectedRoutes as quest5TierProtectedRoutes, publicRoutes as quest5TierPublicRoutes } from "../../module/quest5Tier/ui/routes";
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
  index("./routes/HomePage.tsx"),
  route("login", "./routes/Login.tsx"),
  ...quest3TierPublicRoutes,
  ...profilePublicRoutes,
  ...quest5TierPublicRoutes,
  layout("./layouts/protected.tsx", [
    route("logout", "./routes/Logout.tsx"),
    ...quest3TierProtectedRoutes,
    ...profileProtectedRoutes,
    ...quest5TierProtectedRoutes,
  ]),
] satisfies RouteConfig;
