import { unstable_HistoryRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./provider/AuthContext";
import { ProtectedRoute } from "./provider/ProtectedRoute";
import { browserHistory } from "./monitor/applicationInsights";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";

export function AppRouter({
  publicRoutes,
  protectedRoutes,
}: {
  publicRoutes: Array<{ path: string; element: React.ReactNode }>;
  protectedRoutes: Array<{ path: string; element: React.ReactNode }>;
}) {
  return (
    <Router history={browserHistory}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<NotFound />} />
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          {protectedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={<ProtectedRoute element={element} />} />
          ))}
        </Routes>
      </AuthProvider>
    </Router>
  );
}
