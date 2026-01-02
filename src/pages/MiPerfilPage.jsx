import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
} from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import {
  updatePlayerProfile,
  getPlayerByUserId,
  getPlayerById,
  getPlayerAwards,
  getAllPlayerSeasonStats,
} from "../firebase/endpoints";
import { toast } from "react-toastify";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useNavigate, useParams } from "react-router-dom";
import PlayerStatsCard from "../components/PlayerStatsCard";
import { getPlayerDisplay } from "../utils/playersDisplayName";

function MiPerfilPage() {
  const [user] = useAuthState(auth);
  const { playerId } = useParams(); // Obtener playerId de la URL si existe
  const isViewingOwnProfile = !playerId; // Si no hay playerId, es el perfil propio
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [awards, setAwards] = useState([]);
  const [seasonStats, setSeasonStats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        let player;

        // Si hay playerId en la URL, cargar ese jugador (vista de solo lectura)
        if (playerId) {
          player = await getPlayerById(playerId);
        }
        // Si no hay playerId, cargar el jugador del usuario actual
        else if (user?.uid) {
          player = await getPlayerByUserId(user.uid);
        }

        if (player) {
          setPlayerData({...player, name: getPlayerDisplay(player) });
          setDisplayName(getPlayerDisplay(player));

          // Si estamos viendo otro perfil, NO usar la foto del usuario actual como fallback
          if (playerId) {
            setPhotoPreview(player?.photoURL || "");
          } else {
            setPhotoPreview(player?.photoURL || user?.photoURL || "");
          }

          // Cargar premios
          const playerAwards = await getPlayerAwards(player.id);
          setAwards(playerAwards);

          // Cargar estadísticas por temporada
          const stats = await getAllPlayerSeasonStats(player.id);
          setSeasonStats(stats);
        }
      } catch (error) {
        console.error("Error loading player data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadPlayerData();
  }, [user, playerId]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten archivos de imagen");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    setLoading(true);
    try {
      let photoURL = user.photoURL;

      // Si hay una nueva foto, subirla a Firebase Storage
      if (photoFile) {
        const storageRef = ref(storage, `profile-photos/${user.uid}/${Date.now()}_${photoFile.name}`);
        const snapshot = await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(snapshot.ref);
      }

      // Actualizar Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
        photoURL: photoURL,
      });

      // Actualizar Firestore (tabla players)
      if (playerData?.id) {
        await updatePlayerProfile(playerData.id, {
          name: displayName.trim(),
          photoURL: photoURL,
        });
      }

      toast.success("Perfil actualizado correctamente");
      setPhotoFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
        height: "100dvh",
        overflow: "auto",
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" fontWeight={700} mb={2} color="primary">
            {isViewingOwnProfile ? "Mi Perfil" : `Perfil de ${playerData?.name}`}
          </Typography>

          {isViewingOwnProfile ? (
            // Formulario editable para perfil propio
            <Box component="form" onSubmit={handleSubmit}>
              {/* Foto de perfil */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={photoPreview}
                    alt={displayName}
                    sx={{ width: 100, height: 100, mb: 1 }}
                  >
                    {displayName?.[0]?.toUpperCase()}
                  </Avatar>
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 5,
                      right: -5,
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={loading}
                    />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Haz clic en el ícono de cámara para cambiar tu foto
                </Typography>
              </Box>

              {/* Información de cuenta */}
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Correo:</strong> {user?.email}
                </Typography>
              </Alert>

              {/* Campo de nombre */}
              <TextField
                label="Nombre"
                fullWidth
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                helperText="Este nombre se mostrará en tus partidos y estadísticas"
              />

              {/* Botones */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : "Guardar Cambios"}
                </Button>
              </Box>
            </Box>
          ) : (
            // Vista de solo lectura para otros perfiles
            <Box>
              {/* Foto de perfil (solo lectura) */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={photoPreview}
                  alt={displayName}
                  sx={{ width: 100, height: 100, mb: 1 }}
                >
                  {displayName?.[0]?.toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {displayName}
                </Typography>
              </Box>

              {/* Botón para volver */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(-1)}
              >
                Volver
              </Button>
            </Box>
          )}
        </Paper>

        {/* Estadísticas y Premios */}
        <PlayerStatsCard
          playerData={playerData}
          seasonStats={seasonStats}
          awards={awards}
        />
      </Box>
    </Box>
  );
}

export default MiPerfilPage;
