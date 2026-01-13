import { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginWithGoogle } from "../store/slices/authSlice";
import { useAuth } from "../hooks/useAuthRedux";

const LoginPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Si el usuario ya está autenticado, redirigir a inicio
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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
      await dispatch(loginWithGoogle()).unwrap();
      navigate("/");
    } catch (err) {
      setError("Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetError("");
    setResetSuccess(false);
    
    if (!resetEmail) {
      setResetError("Por favor ingresa tu correo electrónico");
      return;
    }
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setResetDialogOpen(false);
        setResetEmail("");
        setResetSuccess(false);
      }, 3000);
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-email":
          setResetError("Correo electrónico inválido");
          break;
        case "auth/user-not-found":
          setResetError("No existe una cuenta con este correo");
          break;
        default:
          setResetError("Error al enviar el correo. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "primary.main",
      }}
    >
      {/* Header con logo */}
      <Box
        sx={{
          pt: { xs: 4, sm: 6 },
          pb: { xs: 3, sm: 4 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          fontWeight="bold"
          color="white"
          sx={{ fontSize: { xs: "2rem", sm: "3rem" } }}
        >
          ⚽ Mejengas
        </Typography>
      </Box>

      {/* Contenedor del formulario */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "white",
          borderTopLeftRadius: { xs: 24, sm: 32 },
          borderTopRightRadius: { xs: 24, sm: 32 },
          p: { xs: 3, sm: 4 },
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            mx: "auto",
            width: "100%",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              "& .MuiTabs-indicator": {
                height: 3,
              },
            }}
          >
            <Tab
              label="Iniciar Sesión"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
                textTransform: "none",
              }}
            />
            <Tab
              label="Registrarse"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
                textTransform: "none",
              }}
            />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
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
              variant="outlined"
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
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
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
                variant="outlined"
              />
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                mb: 2,
              }}
            >
              {loading
                ? "Cargando..."
                : tabValue === 0
                ? "Iniciar Sesión"
                : "Crear Cuenta"}
            </Button>
          </Box>

          {tabValue === 0 && (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Button
                variant="text"
                onClick={() => {
                  setResetDialogOpen(true);
                  setResetError("");
                  setResetSuccess(false);
                }}
                disabled={loading}
                sx={{
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  textTransform: "none",
                  color: "primary.main",
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
              o continuar con
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            sx={{
              py: 1.5,
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          >
            Google
          </Button>
        </Box>
      </Box>

      {/* Dialog para recuperar contraseña */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => {
          if (!loading) {
            setResetDialogOpen(false);
            setResetEmail("");
            setResetError("");
            setResetSuccess(false);
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Recuperar Contraseña</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              ¡Correo enviado! Revisa tu bandeja de entrada.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </Typography>
              {resetError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {resetError}
                </Alert>
              )}
              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {!resetSuccess && (
            <>
              <Button
                onClick={() => {
                  setResetDialogOpen(false);
                  setResetEmail("");
                  setResetError("");
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePasswordReset}
                variant="contained"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
