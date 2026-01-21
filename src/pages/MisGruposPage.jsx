import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
} from "@mui/material";
import { useAuth } from "../hooks/useAuthRedux";
import { useDispatch, useSelector } from "react-redux";
import {
  createGroupAndRefresh,
  fetchUserGroups,
  selectActiveGroupId,
  selectGroups,
  selectGroupsLoading,
  setActiveGroupId,
} from "../store/slices/groupsSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getPlayerByUserIdAndGroup } from "../firebase/playerEndpoints";
import GroupIcon from "@mui/icons-material/Group";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StarIcon from "@mui/icons-material/Star";
import SettingsIcon from "@mui/icons-material/Settings";

function MisGruposPage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const groups = useSelector(selectGroups);
  const loading = useSelector(selectGroupsLoading);
  const activeGroupId = useSelector(selectActiveGroupId);
  const [openDialog, setOpenDialog] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    dispatch(fetchUserGroups(user.uid));
  }, [user?.uid, dispatch]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("El nombre del grupo es requerido");
      return;
    }

    try {
      setCreatingGroup(true);

      // Intentar obtener el playerId del usuario en el grupo por defecto
      let playerId = null;
      try {
        const player = await getPlayerByUserIdAndGroup(user.uid);
        playerId = player?.id || null;
      } catch (error) {
        // Si no tiene jugador enlazado, continuar sin playerId
        console.log("Usuario sin jugador enlazado");
      }

      await dispatch(
        createGroupAndRefresh({
          userId: user.uid,
          playerId,
          groupData: {
            name: newGroupName.trim(),
            description: newGroupDescription.trim(),
          },
        })
      ).unwrap();
      
      toast.success("Grupo creado exitosamente");
      setOpenDialog(false);
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Error al crear el grupo");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleSelectGroup = (groupId) => {
    dispatch(setActiveGroupId(groupId));
    toast.success("Grupo seleccionado");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <StarIcon fontSize="small" />;
      case "admin":
        return <AdminPanelSettingsIcon fontSize="small" />;
      default:
        return <PeopleIcon fontSize="small" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "owner":
        return "Propietario";
      case "admin":
        return "Administrador";
      default:
        return "Miembro";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "owner":
        return "warning";
      case "admin":
        return "primary";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "grey.50",
        minHeight: "100vh",
        pb: 10,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: 3,
          px: 2,
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Mis Grupos
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
          {groups.length} {groups.length === 1 ? "grupo" : "grupos"}
        </Typography>
      </Box>

      {/* Lista de grupos */}
      <Box sx={{ px: 2 }}>
        {groups.length === 0 ? (
          <Card sx={{ textAlign: "center", py: 6 }}>
            <GroupIcon sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes grupos aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea tu primer grupo para empezar a organizar tus mejengas
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Crear Grupo
            </Button>
          </Card>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {groups.map((group) => (
              <Card key={group.id} sx={{ position: "relative" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 56,
                        height: 56,
                      }}
                    >
                      <GroupIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {group.name}
                      </Typography>
                      {group.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1.5 }}
                        >
                          {group.description}
                        </Typography>
                      )}
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {activeGroupId === group.id && (
                          <Chip
                            label="Activo"
                            size="small"
                            color="success"
                          />
                        )}
                        <Chip
                          icon={getRoleIcon(group.role)}
                          label={getRoleLabel(group.role)}
                          size="small"
                          color={getRoleColor(group.role)}
                        />
                        <Chip
                          icon={<PeopleIcon fontSize="small" />}
                          label={`${group.memberCount || 0} miembros`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant={activeGroupId === group.id ? "contained" : "outlined"}
                    sx={{ flex: 1 }}
                    onClick={() => handleSelectGroup(group.id)}
                  >
                    {activeGroupId === group.id ? "Seleccionado" : "Seleccionar"}
                  </Button>
                  {(group.role === "owner" || group.role === "admin") && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => navigate(`/admin/user-management/${group.id}`)}
                    >
                      Administrar
                    </Button>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      {groups.length > 0 && (
        <Fab
          color="primary"
          aria-label="crear grupo"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
          onClick={() => setOpenDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Dialog para crear grupo */}
      <Dialog
        open={openDialog}
        onClose={() => !creatingGroup && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Crear Nuevo Grupo</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nombre del Grupo"
              fullWidth
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              disabled={creatingGroup}
              placeholder="Ej: Mejengas del Parque"
            />
            <TextField
              label="Descripción (opcional)"
              fullWidth
              multiline
              rows={3}
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              disabled={creatingGroup}
              placeholder="Describe tu grupo de mejengas..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            disabled={creatingGroup}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            disabled={creatingGroup || !newGroupName.trim()}
          >
            {creatingGroup ? <CircularProgress size={24} /> : "Crear Grupo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MisGruposPage;
