import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logPageView, setUserContext, clearUserContext } from "../monitor/telemetry";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (jwt, userId) => {
    localStorage.setItem("token", jwt);
    setToken(localStorage.getItem("token"));
    setUserContext(userId);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    clearUserContext();
  };

  const isAuthenticated = !!token;

  useEffect(() => {
    console.log("changed location!!!!");
    logPageView(location.pathname);
  }, [location]);

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export { AuthContext, AuthProvider, useAuth };
