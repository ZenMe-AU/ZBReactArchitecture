import { route, index, layout } from "@react-router/dev/routes";

export const publicRoutes = [index("./routes/HomePage.tsx"), route("login", "./routes/Login.tsx")];

export const protectedRoutes = [route("logout", "./routes/Logout.tsx")];
