import { useState, useEffect } from "react";
import {
  Box,
  Grid2,
  Card,
  Typography,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthRedux";
import { linkUserToPlayer, unlinkUserFromPlayer } from "../firebase/playerEndpoints";
import { getGroupWithMembers, sendGroupInvite } from "../firebase/endpoints";

const UserManagementPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [userMemberships, setUserMemberships] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getGroupWithMembers(groupId);
      
      if (!data.groupData) {
        toast.error("Grupo no encontrado");
        navigate("/mis-grupos");
        return;
      }

      setGroupData(data.groupData);
      setPlayers(data.players);
      setUsers(data.users);
      setUserMemberships(data.userMemberships);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos");
      navigate("/mis-grupos");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkUser = (user) => {
    setSelectedUser(user);
    // Usar playerId desde userMemberships en lugar de user.playerId
    setSelectedPlayerId(userMemberships[user.id] || "");
    setLinkDialogOpen(true);
  };

  const handleSaveLink = async () => {
    if (!selectedUser || !selectedPlayerId) return;

    try {
      await linkUserToPlayer(
        selectedUser.id,
        selectedPlayerId,
        selectedUser.displayName,
        selectedUser.photoURL,
        selectedUser.email,
        groupId
      );

      toast.success("Usuario enlazado correctamente");
      setLinkDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error linking user:", error);
      toast.error("Error al enlazar usuario");
    }
  };

  const handleUnlinkUser = async (userId) => {
    const playerId = userMemberships[userId];
    if (!playerId) return;

    try {
      await unlinkUserFromPlayer(userId, groupId);

      toast.success("Usuario desenlazado correctamente");
      loadData();
    } catch (error) {
      console.error("Error unlinking user:", error);
      toast.error("Error al desenlazar usuario");
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("El correo es requerido");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error("Formato de correo inválido");
      return;
    }

    try {
      setSendingInvite(true);
      
      await sendGroupInvite(
        inviteEmail,
        groupId,
        groupData?.name || "",
        user.uid,
        user.displayName || user.email
      );

      toast.success("Invitación enviada correctamente");
      setInviteDialogOpen(false);
      setInviteEmail("");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Error al enviar invitación");
    } finally {
      setSendingInvite(false);
    }
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
    <Box sx={{ height: "100%", overflow: "auto", bgcolor: "grey.50", minHeight: "100vh", pb: 10 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 3,
          px: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/mis-grupos")}
          sx={{ color: "white", minWidth: "auto", px: 1 }}
        >
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            Administrar Grupo
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
            {groupData?.name || "Cargando..."}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2 }}>
        <Grid2 container spacing={3}>
        {/* Columna de usuarios autenticados */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Miembros del Grupo
              </Typography>
              <Button
                size="small"
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteDialogOpen(true)}
              >
                Invitar
              </Button>
            </Box>
            <Box>
              {users.map((user) => {
                return (
                  <Box
                    key={user.id}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                      p: 2,
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "flex-start", md: "center" },
                      gap: { xs: 2, md: 2 },
                    }}
                  >
                    {/* Avatar */}
                    <Avatar src={user.photoURL} sx={{ flexShrink: 0 }}>
                      <PersonIcon />
                    </Avatar>

                    {/* Contenido principal */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                          {user.displayName || user.email}
                        </Typography>
                        {user.role === "admin" && (
                          <Chip
                            icon={<AdminPanelSettingsIcon />}
                            label="Admin"
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        {user.email}
                      </Typography>
                      {userMemberships[user.id] && players.find(p => p.id === userMemberships[user.id]) && (
                        <Chip
                          label={`Jugador: ${players.find(p => p.id === userMemberships[user.id])?.originalName || players.find(p => p.id === userMemberships[user.id])?.name}`}
                          size="small"
                          color="success"
                        />
                      )}
                    </Box>

                    {/* Botones */}
                    <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", md: "auto" } }}>
                      {userMemberships[user.id] ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<LinkOffIcon />}
                          onClick={() => handleUnlinkUser(user.id)}
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
                  </Box>
                )
              })}
              {users.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No hay miembros en este grupo
                </Typography>
              )}
            </Box>
          </Card>
        </Grid2>

        {/* Columna de jugadores */}
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Jugadores del Grupo
            </Typography>
            <Box>
              {players.map((player) => {
                return (
                <Box
                  key={player.id}
                  sx={{
                    border: 1,
                    borderColor: player.userId ? "success.main" : "divider",
                    borderRadius: 1,
                    mb: 1,
                    p: 1.5,
                    bgcolor: player.userId ? "success.50" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar sx={{ flexShrink: 0 }}>
                    {player.name[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" noWrap>
                      {player?.originalName ?? player.name}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {player.userId ? (
                        <Chip label="Enlazado" size="small" color="success" />
                      ) : (
                        <Chip label="Sin enlazar" size="small" color="default" />
                      )}
                    </Box>
                  </Box>
                </Box>
              )})}
            </Box>
          </Card>
        </Grid2>
      </Grid2>
      </Box>

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

      {/* Dialog para invitar usuario */}
      <Dialog 
        open={inviteDialogOpen} 
        onClose={() => !sendingInvite && setInviteDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Ingresa el correo electrónico del usuario que deseas invitar a unirse a este grupo.
            </Typography>
            <TextField
              label="Correo Electrónico"
              type="email"
              fullWidth
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={sendingInvite}
              placeholder="ejemplo@correo.com"
              sx={{ mt: 2 }}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)} disabled={sendingInvite}>
            Cancelar
          </Button>
          <Button
            onClick={handleSendInvite}
            variant="contained"
            disabled={sendingInvite || !inviteEmail.trim()}
          >
            {sendingInvite ? <CircularProgress size={24} /> : "Enviar Invitación"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
