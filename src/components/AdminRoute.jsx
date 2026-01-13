import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuthRedux";
import { Box, CircularProgress, Typography } from "@mui/material";

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Verificando permisos...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          p: 4,
        }}
      >
        <Typography variant="h4" color="error">
          🚫 Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No tienes permisos de administrador para acceder a esta página.
        </Typography>
      </Box>
    );
  }

  return children;
};

export default AdminRoute;
