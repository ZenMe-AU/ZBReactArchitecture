import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Navbar from "../components/Navbar";
import { authVerify } from "../api/auth";

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("check user");
      if (isAuthenticated) {
        try {
          setLoading(true);
          const profileData = await authVerify();
          setProfile(profileData); // Save the fetched user profile
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          navigate("/login", { state: { from: location }, replace: true }); // Redirect to login if verification fails
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login", { state: { from: location }, replace: true }); // Redirect if not authenticated
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading screen while fetching profile
  }

  return (
    <>
      <Navbar profile={profile} />
      {element}
    </>
  );
};

export { ProtectedRoute };
// import { createContext, useContext, useState } from "react";
// import { Navigate, useLocation } from "react-router-dom";
// import Navbar from "./components/Navbar";

// // 建立 AuthContext
// const AuthContext = createContext(null);

// // 提供 AuthContext 的 Provider
// const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("token"));

//   const login = (jwt) => {
//     localStorage.setItem("token", jwt);
//     setToken(localStorage.getItem("token"));
//   };

//   const logout = () => {
//     setToken(null);
//     localStorage.removeItem("token");
//   };

//   const isAuthenticated = !!token;

//   return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
// };

// // ProtectedRoute 元件
// const ProtectedRoute = ({ element }) => {
//   const { isAuthenticated } = useContext(AuthContext);
//   const location = useLocation();
//   return isAuthenticated ? (
//     <>
//       <Navbar />
//       {element}
//     </>
//   ) : (
//     <Navigate to="/login" state={{ from: location }} replace />
//   );
// };

// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within an AuthProvider");
//   return context;
// };

// export { AuthContext, AuthProvider, ProtectedRoute, useAuth };

// const [isAuthenticated, setIsAuthenticated] = useState(false);
// const [isAuthenticated, setIsAuthenticated] = useState(true);

// const login = () => setIsAuthenticated(true);
// const logout = () => setIsAuthenticated(false);
