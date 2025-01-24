import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getProfileList } from "../api/profile";
import { login as authLogin } from "../api/auth";
import { Profile } from "../types/interfaces";
import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress, Autocomplete, TextField } from "@mui/material";

function Login() {
  const { isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for user selection, loading, error
  const [userList, setUserList] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user list on component mount
  useEffect(() => {
    setError(null);
    localStorage.removeItem("profileId"); //temp
    console.log("A===" + localStorage.getItem("profileId"));
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const profiles = await getProfileList();
        setUserList(profiles);
      } catch (err) {
        console.error("Error fetching profile list:", err);
        setError("Failed to fetch user list.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle login
  const handleLogin = async () => {
    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }
    try {
      setLoading(true);
      localStorage.setItem("profileId", selectedUserId); //temp
      console.log("B===" + localStorage.getItem("profileId"));
      console.log("!===" + selectedUserId);

      const response = await authLogin(selectedUserId);
      login(response.token, selectedUserId);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
      localStorage.removeItem("profileId"); //temp
      logout();
    } finally {
      setLoading(false);
      console.log("C===" + localStorage.getItem("profileId"));
    }
  };
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5" padding={4}>
      {isAuthenticated ? (
        <Box display="flex" flexDirection="column" alignItems="center" bgcolor="white" p={4} borderRadius={2} boxShadow={3} maxWidth={400}>
          <Typography variant="h5" gutterBottom>
            You are logged in.
          </Typography>
          <Button variant="contained" color="error" onClick={logout} sx={{ mt: 2 }}>
            Logout
          </Button>
        </Box>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          bgcolor="white"
          p={4}
          borderRadius={2}
          boxShadow={3}
          maxWidth={400}
          width="100%"
        >
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}
          {/* <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="user-select-label">Select a user</InputLabel>
            <Select
              labelId="user-select-label"
              id="user-select"
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(e.target.value)}
              label="Select a user"
            >
              <MenuItem value="" disabled>
                -- Select a user --
              </MenuItem>
              {userList.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.id} - {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <Autocomplete
            disablePortal
            onChange={(_, newValue) => {
              setSelectedUserId(newValue?.id);
            }}
            getOptionLabel={(user) => `${user.id} - ${user.name}`}
            options={userList}
            sx={{ width: 300, mb: 2 }}
            renderInput={(params) => <TextField {...params} label="Select a user" />}
          />
          <Button variant="contained" color="primary" onClick={handleLogin} disabled={loading} fullWidth>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Login;

//   return (
//     <>
//       {isAuthenticated ? (
//         <div className="logged-in-container">
//           <p>You are logged in.</p>
//           <button onClick={logout} className="logout-button">
//             Logout
//           </button>
//         </div>
//       ) : (
//         <div className="login-container">
//           <h1>Login</h1>
//           {error && <p className="error">{error}</p>}
//           <div className="form-group">
//             <label htmlFor="user-select">Select a user:</label>
//             <select id="user-select" value={selectedUserId || ""} onChange={(e) => setSelectedUserId(e.target.value)}>
//               <option value="" disabled>
//                 -- Select a user --
//               </option>
//               {userList.map((user) => (
//                 <option key={user.id} value={user.id}>
//                   {user.id} - {user.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <button onClick={handleLogin} disabled={loading} className="login-button">
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </div>
//       )}
//     </>
//   );
