import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useAuth } from "../hooks/useAuthRedux";

const AppDrawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAdmin } = useAuth();

  const menuItems = [
    { text: 'Histórico de Partidos', icon: <HistoryIcon />, path: '/' },
    { text: 'Resumen de Temporada', icon: <EmojiEventsIcon />, path: '/resumen-temporada' },
    { text: 'Jugadores', icon: <SportsSoccerIcon />, path: '/jugadores' },
    { text: 'Porteros', icon: <SportsHandballIcon />, path: '/porteros' },
    { text: 'Balón de Oro', icon: <EmojiEventsIcon />, path: '/balon-de-oro/resultados' },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
      onClose();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation">
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">
            ⚽ Mejengas
          </Typography>
          <Typography variant="caption">
            Gestión de partidos
          </Typography>
        </Box>
        <Divider />

        {/* User Profile Section */}
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
                onClose();
              }}
            >
              <Avatar src={user?.photoURL} alt={user?.displayName || user?.email}>
                {(user?.displayName || user?.email)?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Typography variant="body2" fontWeight="bold" noWrap>
                  {user?.displayName || 'Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider />
          </>
        )}

        {/* Main Menu */}
        <List onClick={toggleDrawer} onKeyDown={toggleDrawer}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => handleMenuClick(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />

        {/* Admin Menu */}
        {isAdmin && (
          <>
            <List onClick={toggleDrawer} onKeyDown={toggleDrawer}>
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

        {/* Login/Logout */}
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
              <ListItemButton onClick={() => { navigate('/login'); onClose(); }}>
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
  );
};

export default AppDrawer;
