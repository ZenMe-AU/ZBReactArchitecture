import { Helmet } from "react-helmet";
import { Box, Button, Typography, Alert, CircularProgress, Autocomplete, TextField } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { loader as loginLoader, action as loginAction } from "../app/routes/login.loader";
// import type { Route } from "../+types/root";
import { login } from "../api/auth";

export const clientLoader = loginLoader;
// export const clientAction = loginAction;

export default function Login({ loaderData }: { loaderData: { userList: Array<{ id: string; name: string }>; error?: string } }) {
  const { userList, error: loaderError } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [error, setError] = useState(loaderError);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("userId", selectedUserId);
      const response = await fetch("/login", {
        method: "POST",
        body: formData,
      });
      const response = await login(selectedUserId);
      const result = await response.json();
      if (result.success) {
        navigate(location.state?.from?.pathname || "/", { replace: true });
      } else {
        setError("Login failed.");
      }
    } catch (e) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Box bgcolor="white" p={4} borderRadius={2} boxShadow={3} maxWidth={400} width="100%">
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Autocomplete
            disablePortal
            onChange={(_, newValue) => setSelectedUserId(newValue?.id)}
            getOptionLabel={(user) => `${user.id} - ${user.name}`}
            options={userList}
            sx={{ width: 300, mb: 2 }}
            renderInput={(params) => <TextField {...params} label="Select a user" />}
          />
          <Button fullWidth variant="contained" disabled={loading} onClick={handleLogin}>
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </Box>
      </Box>
    </>
  );
}
