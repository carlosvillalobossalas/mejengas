import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { createOrUpdateUser } from "../firebase/userManagement";

const LoginPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tabValue === 0) {
        // Iniciar sesión
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await createOrUpdateUser(userCredential.user);
        navigate("/");
      } else {
        // Registrarse
        if (password !== confirmPassword) {
          setError("Las contraseñas no coinciden");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createOrUpdateUser(userCredential.user);
        navigate("/");
      }
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-email":
          setError("Correo electrónico inválido");
          break;
        case "auth/user-disabled":
          setError("Usuario deshabilitado");
          break;
        case "auth/user-not-found":
          setError("Usuario no encontrado");
          break;
        case "auth/wrong-password":
          setError("Contraseña incorrecta");
          break;
        case "auth/email-already-in-use":
          setError("Este correo ya está registrado");
          break;
        case "auth/weak-password":
          setError("Contraseña muy débil");
          break;
        default:
          setError("Error al autenticar. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await createOrUpdateUser(userCredential.user);
      navigate("/");
    } catch (err) {
      setError("Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "grey.50",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Card
        sx={{
          maxWidth: { xs: "100%", sm: 450 },
          width: "100%",
          p: { xs: 3, sm: 4 },
          boxShadow: 3,
          m: { xs: 1, sm: 0 },
        }}
      >
        <Typography 
          variant="h4" 
          textAlign="center" 
          fontWeight="bold" 
          gutterBottom
          sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" }, mb: 2 }}
        >
          ⚽ Mejengas
        </Typography>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{ mb: 2 }}
          variant="fullWidth"
        >
          <Tab 
            label="Iniciar Sesión" 
            sx={{ 
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              minHeight: { xs: 40, sm: 48 },
              px: { xs: 1, sm: 2 },
            }} 
          />
          <Tab 
            label="Registrarse" 
            sx={{ 
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              minHeight: { xs: 40, sm: 48 },
              px: { xs: 1, sm: 2 },
            }} 
          />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleEmailPasswordAuth}>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
            size="medium"
          />

          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
            size="medium"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {tabValue === 1 && (
            <TextField
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
              size="medium"
            />
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ 
              mb: 2,
              py: { xs: 1.5, sm: 1.75 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          >
            {loading
              ? "Cargando..."
              : tabValue === 0
              ? "Iniciar Sesión"
              : "Registrarse"}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
            o continuar con
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          sx={{
            borderColor: "#4285f4",
            color: "#4285f4",
            py: { xs: 1.5, sm: 1.75 },
            fontSize: { xs: "0.875rem", sm: "1rem" },
            "&:hover": {
              borderColor: "#357ae8",
              bgcolor: "rgba(66, 133, 244, 0.04)",
            },
          }}
        >
          Continuar con Google
        </Button>
      </Card>
    </Box>
  );
};

export default LoginPage;
