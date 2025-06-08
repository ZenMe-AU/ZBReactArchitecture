import { BrowserRouter, Routes, Route, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./provider/AuthContext";
import { ProtectedRoute } from "./provider/ProtectedRoute";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import { AppRouterProps, RouteItem } from "./types/interfaces";

export function AppRouter({ publicRoutes, protectedRoutes }: AppRouterProps) {
  const router = createBrowserRouter([
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <Login /> },
    { path: "/*", element: <NotFound /> },
    ...protectedRoutes.map(({ path, element }: RouteItem) => ({
      path,
      element: <ProtectedRoute element={element} />,
    })),
    ...publicRoutes.map(({ path, element }: RouteItem) => ({
      path,
      element,
    })),
  ]);

  return router;
}
