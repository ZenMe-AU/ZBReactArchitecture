import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout } from "@react-router/dev/routes";

export const protectedRoutes = [];
export const publicRoutes = [route("profile", "../../module/profile/ui/routes/HomePage.tsx")];
