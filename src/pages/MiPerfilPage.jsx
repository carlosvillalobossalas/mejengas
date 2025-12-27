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
import { updatePlayerProfile, getPlayerByUserId } from "../firebase/endpoints";
import { toast } from "react-toastify";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

function MiPerfilPage() {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlayerData = async () => {
      if (user?.uid) {
        try {
          const player = await getPlayerByUserId(user.uid);
          setPlayerData(player);
          setDisplayName(player?.name || user.displayName || "");
          setPhotoPreview(user.photoURL || "");
        } catch (error) {
          console.error("Error loading player data:", error);
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadPlayerData();
  }, [user]);

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
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", p: 2 }}>
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Paper sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" fontWeight={700} mb={3} color="primary">
            Mi Perfil
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Foto de perfil */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={photoPreview}
                  alt={displayName}
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {displayName?.[0]?.toUpperCase()}
                </Avatar>
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: -5,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  <PhotoCameraIcon />
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
            <Alert severity="info" sx={{ mb: 3 }}>
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
              sx={{ mb: 3 }}
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
        </Paper>
      </Box>
    </Box>
  );
}

export default MiPerfilPage;
