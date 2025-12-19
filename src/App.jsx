import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HistoryIcon from "@mui/icons-material/History";
import { getAllGKs, getAllMatches, getAllPlayers } from "./firebase/endpoints";
import { GoalkeepersTablePage } from "./pages/GoalkeepersTablePage";
import { PlayersTablePage } from "./pages/PlayersTablePage";
import { Route, Routes, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import AddNewPlayerButton from "./components/AddNewPlayerButton";
import HistoricMatchesList from "./components/HistoricMatchesList";
import NewMatch from "./pages/NewMatch";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SeasonSummaryPage from "./pages/SeasonSummaryPage";

const App = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [goalkeepers, setGoalkeepers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Histórico de Partidos', icon: <HistoryIcon />, path: '/' },
    { text: 'Resumen de Temporada', icon: <EmojiEventsIcon />, path: '/resumen-temporada' },
    { text: 'Jugadores', icon: <SportsSoccerIcon />, path: '/jugadores' },
    { text: 'Porteros', icon: <SportsHandballIcon />, path: '/porteros' },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

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
      {/* AppBar con menú hamburguesa */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
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
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" fontWeight="bold">
              ⚽ Mejengas
            </Typography>
            <Typography variant="caption">
              Gestión de partidos
            </Typography>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => handleMenuClick(item.path)}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ height: "calc(100vh - 56px)", overflow: "hidden" }}>
        <Routes>
          <Route path="" element={<HistoricMatchesList matches={matches} />} />
          <Route path="/resumen-temporada" element={<SeasonSummaryPage />} />
          <Route
            path="/jugadores"
            element={<PlayersTablePage players={players} />}
          />
          <Route
            path="/porteros"
            element={<GoalkeepersTablePage goalkeepers={goalkeepers} />}
          />
          <Route path="admin/:admin">
            <Route path="" element={<NewMatch players={players} />}>
              <Route path="" element={<AddNewPlayerButton />} />
            </Route>
          </Route>
        </Routes>
      </Box>
      <ToastContainer position="top-right" />
    </Box>
  );
};

export default App;
