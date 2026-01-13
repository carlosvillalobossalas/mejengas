import { Box, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { getAllGKs, getAllMatches } from "./firebase/endpoints";
import { getAllPlayers } from "./firebase/playerEndpoints";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import AppDrawer from "./components/AppDrawer";
import AppRoutes from "./components/AppRoutes";
import AuthListener from "./components/AuthListener";

const App = () => {
  const [players, setPlayers] = useState([]);
  const [goalkeepers, setGoalkeepers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = getAllPlayers(setPlayers);
    return () => unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = getAllGKs(setGoalkeepers);
    return () => unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = getAllMatches(setMatches);
    return () => unsubscribe;
  }, []);

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mejengas
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <AuthListener />

      {/* Routes */}
      <AppRoutes players={players} goalkeepers={goalkeepers} matches={matches} />

      <ToastContainer position="top-right" />
    </Box>
  );
};

export default App;
