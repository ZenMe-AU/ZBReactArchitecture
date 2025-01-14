import { AppBar, Toolbar, Typography, Avatar, Button, Box } from "@mui/material";
import { useAuth } from "../AuthContext";

const Navbar = ({ profile }) => {
  const { logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Box display="flex" alignItems="center" flexGrow={1}>
          {profile?.avatar && <Avatar src={profile.avatar} alt={profile.name} sx={{ mr: 2 }} />}
          <Typography variant="h6" component="div">
            {profile?.id} {profile?.name || "Unknown User"}
          </Typography>
        </Box>
        <Button color="inherit" onClick={logout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
