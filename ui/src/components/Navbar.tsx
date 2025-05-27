import { AppBar, Toolbar, Typography, Avatar, Button, Box } from "@mui/material";
import { useAuth } from "../AuthContext";
import { logEvent } from "../telemetry";

const Navbar = ({ profile }) => {
  const { logout } = useAuth();
  const hanedleLogout = () => {
    logEvent("btnLogoutClick", {
      parentId: "Navbar",
    });
    logout();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          {profile?.avatar && <Avatar src={profile.avatar} alt={profile.name} sx={{ mr: 2 }} />}
          <Typography variant="h6" component="div">
            {profile?.id} {profile?.name || "Unknown User"}
          </Typography>
        </Box>
        <Button color="inherit" onClick={hanedleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
