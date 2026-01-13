import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { GoalkeepersTablePage } from "../pages/GoalkeepersTablePage";
import { PlayersTablePage } from "../pages/PlayersTablePage";
import BalonDeOro from "../pages/BalonDeOro";
import BallonDeOroResults from "../pages/BallonDeOroResults";
import MiPerfilPage from "../pages/MiPerfilPage";
import LoginPage from "../pages/LoginPage";
import AdminRoute from "./AdminRoute";
import UserManagementPage from "../pages/UserManagementPage";
import HistoricMatchesList from "./HistoricMatchesList";
import NewMatch from "../pages/NewMatch";
import SeasonSummaryPage from "../pages/SeasonSummaryPage";
import { useAuth } from "../hooks/useAuthRedux";

const AppRoutes = ({ players, goalkeepers, matches }) => {
  const { user, loading: loadingAuth } = useAuth();

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

  return (
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
  );
};

export default AppRoutes;
