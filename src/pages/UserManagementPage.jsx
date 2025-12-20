import { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  Card,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { collection, getDocs, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { toast } from "react-toastify";

const UserManagementPage = () => {
  const [authUsers, setAuthUsers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar usuarios de Firestore users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);

      // Cargar jugadores
      const playersSnapshot = await getDocs(collection(db, "Players"));
      const playersData = playersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playersData);

      // En producción, necesitarías una Cloud Function para listar usuarios de Auth
      // Por ahora solo mostramos los que están en Firestore
      setAuthUsers(usersData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkUser = (user) => {
    setSelectedUser(user);
    setSelectedPlayerId(user.playerId || "");
    setLinkDialogOpen(true);
  };

  const handleSaveLink = async () => {
    if (!selectedUser || !selectedPlayerId) return;

    try {
      // Obtener el jugador para guardar su nombre original
      const playerDoc = await getDoc(doc(db, "Players", selectedPlayerId));
      const playerData = playerDoc.data();

      // Actualizar documento de usuario
      await updateDoc(doc(db, "users", selectedUser.id), {
        playerId: selectedPlayerId,
        updatedAt: new Date(),
      });

      // Actualizar documento de jugador - incluye el displayName del usuario
      await updateDoc(doc(db, "Players", selectedPlayerId), {
        userId: selectedUser.id,
        name: selectedUser.displayName || selectedUser.email,
        // Guardar el nombre original solo si no existe ya (para poder restaurarlo al desenlazar)
        ...((!playerData.originalName) && { originalName: playerData.name }),
      });

      toast.success("Usuario enlazado correctamente");
      setLinkDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error linking user:", error);
      toast.error("Error al enlazar usuario");
    }
  };

  const handleUnlinkUser = async (user) => {
    if (!user.playerId) return;

    try {
      // Obtener el nombre actual del jugador antes de desenlazar
      const playerDoc = await getDoc(doc(db, "Players", user.playerId));
      const playerData = playerDoc.data();
      
      // Actualizar documento de usuario
      await updateDoc(doc(db, "users", user.id), {
        playerId: null,
        updatedAt: new Date(),
      });

      // Actualizar documento de jugador - mantener el nombre o usar el original si existe
      await updateDoc(doc(db, "Players", user.playerId), {
        userId: null,
        // Si existe originalName, restaurarlo; si no, mantener el nombre actual
        ...(playerData.originalName && { name: playerData.originalName }),
      });

      toast.success("Usuario desenlazado correctamente");
      loadData();
    } catch (error) {
      console.error("Error unlinking user:", error);
      toast.error("Error al desenlazar usuario");
    }
  };

  const getPlayerName = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Desconocido";
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          👥 Gestión de Usuarios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enlaza usuarios autenticados con jugadores del sistema
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Para ver todos los usuarios de Firebase Auth, necesitas
          implementar una Cloud Function. Por ahora solo se muestran usuarios registrados en
          Firestore.
        </Typography>
      </Alert>

      <Grid2 container spacing={3}>
        {/* Columna de usuarios autenticados */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Usuarios Autenticados
            </Typography>
            <List>
              {users.map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                  }}
                  secondaryAction={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {user.playerId ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<LinkOffIcon />}
                          onClick={() => handleUnlinkUser(user)}
                        >
                          Desenlazar
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<LinkIcon />}
                          onClick={() => handleLinkUser(user)}
                        >
                          Enlazar
                        </Button>
                      )}
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={user.photoURL}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {user.displayName || user.email}
                        {user.role === "admin" && (
                          <Chip
                            icon={<AdminPanelSettingsIcon />}
                            label="Admin"
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        {user.email}
                        {user.playerId && (
                          <Chip
                            label={`Jugador: ${getPlayerName(user.playerId)}`}
                            size="small"
                            color="success"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
              {users.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No hay usuarios registrados
                </Typography>
              )}
            </List>
          </Card>
        </Grid2>

        {/* Columna de jugadores */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Jugadores del Sistema
            </Typography>
            <List>
              {players.map((player) => (
                <ListItem
                  key={player.id}
                  sx={{
                    border: 1,
                    borderColor: player.userId ? "success.main" : "divider",
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: player.userId ? "success.50" : "transparent",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {player.name[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={player.name}
                    secondary={
                      player.userId ? (
                        <Chip label="Enlazado" size="small" color="success" />
                      ) : (
                        <Chip label="Sin enlazar" size="small" color="default" />
                      )
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid2>
      </Grid2>

      {/* Dialog para enlazar usuario */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enlazar Usuario con Jugador</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Usuario: <strong>{selectedUser?.displayName || selectedUser?.email}</strong>
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Seleccionar Jugador</InputLabel>
              <Select
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                label="Seleccionar Jugador"
              >
                {players.length === 0 ? (
                  <MenuItem disabled>No hay jugadores disponibles</MenuItem>
                ) : (
                  players
                    .filter((p) => !p.userId || p.userId === selectedUser?.id)
                    .map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name}
                      </MenuItem>
                    ))
                )}
              </Select>
            </FormControl>
            {players.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {players.filter((p) => !p.userId || p.userId === selectedUser?.id).length} jugadores disponibles
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveLink}
            variant="contained"
            disabled={!selectedPlayerId}
          >
            Enlazar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
