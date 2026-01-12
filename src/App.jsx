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
  Avatar,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { getAllGKs, getAllMatches } from "./firebase/endpoints";
import { getAllPlayers } from "./firebase/playerEndpoints";
import { GoalkeepersTablePage } from "./pages/GoalkeepersTablePage";
import { PlayersTablePage } from "./pages/PlayersTablePage";
import BalonDeOro from "./pages/BalonDeOro";
import BallonDeOroResults from "./pages/BallonDeOroResults";
import MiPerfilPage from "./pages/MiPerfilPage";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import LoginPage from "./pages/LoginPage";
import AdminRoute from "./components/AdminRoute";
import UserManagementPage from "./pages/UserManagementPage";
import { useAdmin } from "./hooks/useAdmin";
import { createOrUpdateUser } from "./firebase/userManagement";
import { useEffect, useState } from "react";
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
  const [user, loadingAuth] = useAuthState(auth);
  const { isAdmin } = useAdmin(user);

  // Ruta protegida solo por autenticación
  const AuthRoute = ({ children }) => {
    if (loadingAuth) {
      return (
        <Box sx={{ height: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      );
    }
    return user ? children : <Navigate to="/login" replace />;
  };

  // Crear/actualizar documento de usuario en Firestore al autenticarse
  useEffect(() => {
    if (user) {
      createOrUpdateUser(user);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      setDrawerOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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
    { text: 'Balón de Oro', icon: <EmojiEventsIcon />, path: '/balon-de-oro/resultados' },
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
          {user && (
            <>
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                  transition: 'background-color 0.2s',
                }}
                onClick={() => {
                  navigate('/mi-perfil');
                  setDrawerOpen(false);
                }}
              >
                <Avatar src={user.photoURL} alt={user.displayName || user.email}>
                  {(user.displayName || user.email)?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography variant="body2" fontWeight="bold" noWrap>
                    {user.displayName || 'Usuario'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Divider />
            </>
          )}
          <List onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
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
          <Divider />
          {isAdmin && (
            <>
              <List onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMenuClick('/admin/nuevo-partido')}>
                    <ListItemIcon>
                      <AddCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Registrar Partido" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMenuClick('/admin/usuarios')}>
                    <ListItemIcon>
                      <ManageAccountsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Gestión de Usuarios" />
                  </ListItemButton>
                </ListItem>
              </List>
              <Divider />
            </>
          )}
          <List>
            {user ? (
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
              </ListItem>
            ) : (
              <ListItem disablePadding>
                <ListItemButton onClick={() => { navigate('/login'); setDrawerOpen(false); }}>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary="Iniciar Sesión" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ height: "calc(100vh - 56px)", overflow: "hidden" }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="" element={<HistoricMatchesList matches={matches} players={players} />} />
          <Route path="/resumen-temporada" element={<SeasonSummaryPage />} />
          <Route path="/jugadores" element={<PlayersTablePage players={players} />} />
          <Route path="/porteros" element={<GoalkeepersTablePage goalkeepers={goalkeepers} />} />
          <Route path="/admin/usuarios" element={
            <AdminRoute>
              <UserManagementPage />
            </AdminRoute>
          } />
          <Route path="/admin/nuevo-partido" element={
            <AdminRoute>
              <NewMatch players={players} />
            </AdminRoute>
          } />
          <Route path="/balon-de-oro" element={
            <AuthRoute>
              <BalonDeOro />
            </AuthRoute>
          } />
          <Route path="/balon-de-oro/resultados" element={
            <AuthRoute>
              <BallonDeOroResults />
            </AuthRoute>
          } />
          <Route path="/mi-perfil" element={
            <AuthRoute>
              <MiPerfilPage />
            </AuthRoute>
          } />
          <Route path="/perfil/:playerId" element={
            <AuthRoute>
              <MiPerfilPage />
            </AuthRoute>
          } />
        </Routes>
      </Box>
      <ToastContainer position="top-right" />
    </Box>
  );
};

export default App;
