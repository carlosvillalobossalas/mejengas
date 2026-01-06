import { SportsSoccer } from "@mui/icons-material";
import { Box, Avatar, Typography, Tabs, Tab, Chip } from "@mui/material";
import { useState } from "react";
import AssistIcon from "/assets/shoe.png";
import { getPlayerDisplay } from "../utils/playersDisplayName";

const MatchLineup = ({ team1Players = [], team2Players = [], allPlayers = [] }) => {
  const [selectedTeam, setSelectedTeam] = useState(0);

  const handleTeamChange = (event, newValue) => {
    setSelectedTeam(newValue);
  };

  const getPlayerInfo = (playerId) => {
    return allPlayers.find((p) => p.id === playerId);
  };

  const getPlayerInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getPositionCoordinates = (position, index, totalInPosition) => {
    // Coordenadas en porcentaje (x: horizontal 0-100%, y: vertical 0-100% desde arriba)
    
    // Portero siempre abajo centro
    if (position === "POR") {
      return { x: 50, y: 90 };
    }

    // Posiciones verticales (y) por línea
    const yPositions = {
      DEL: 15,  // Delanteros arriba
      MED: 45,  // Medios en el centro
      DEF: 70,  // Defensas más atrás
    };

    // Calcular posición horizontal (x) distribuyendo equitativamente
    const getXPosition = (index, total) => {
      if (total === 1) {
        return 50; // Centro si es solo uno
      }
      
      if (total === 2) {
        // Cuando son 2, más juntos y centrados
        return index === 0 ? 35 : 65;
      }
      
      // Para 3 o más, distribuir equitativamente con márgenes del 15% y 85%
      const minX = 15;
      const maxX = 85;
      const spacing = (maxX - minX) / (total - 1);
      
      return minX + (spacing * index);
    };

    const x = getXPosition(index, totalInPosition);
    const y = yPositions[position] || 50;

    return { x, y };
  };

  const renderPlayer = (player, positionIndex) => {
    if (!player || !player.id) return null;

    const playerInfo = getPlayerInfo(player.id);
    const playerName = getPlayerDisplay(playerInfo)
    const playerPhoto = playerInfo?.photoURL;
    
    // Agrupar jugadores por posición para calcular índices
    const currentTeamPlayers = selectedTeam === 0 ? team1Players : team2Players;
    const playersInPosition = currentTeamPlayers.filter(p => p && p.position === player.position);
    const indexInPosition = playersInPosition.findIndex(p => p.id === player.id);
    
    const coords = getPositionCoordinates(player.position, indexInPosition, playersInPosition.length);
    const hasStats = (player.goals > 0 || player.assists > 0 || player.ownGoals > 0);

    return (
      <Box
        key={player.id}
        sx={{
          position: "absolute",
          left: `${coords.x}%`,
          top: `${coords.y}%`,
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          zIndex: 2,
        }}
      >
        {/* Avatar del jugador */}
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={playerPhoto}
            sx={{
              width: 52,
              height: 52,
              border: "3px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              bgcolor: player.position === "POR" ? "warning.main" : "primary.main",
              fontSize: "1.25rem",
              fontWeight: "bold",
            }}
          >
            {!playerPhoto && getPlayerInitial(playerName)}
          </Avatar>
          
          {/* Badge de posición */}
          <Chip
            label={player.position}
            size="small"
            sx={{
              position: "absolute",
              top: -4,
              right: -4,
              height: 18,
              fontSize: "0.6rem",
              fontWeight: "bold",
              bgcolor: "white",
              border: "2px solid",
              borderColor: player.position === "POR" ? "warning.main" : "primary.main",
              "& .MuiChip-label": { px: 0.5 },
            }}
          />
        </Box>

        {/* Nombre del jugador */}
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{
            bgcolor: "rgba(255,255,255,0.95)",
            px: 1,
            py: 0.25,
            borderRadius: 1,
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            fontSize: "0.7rem",
            maxWidth: 80,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {playerName}
        </Typography>

        {/* Estadísticas */}
        {hasStats && (
          <Box
            sx={{
              display: "flex",
              gap: 0.25,
              bgcolor: "rgba(255,255,255,0.95)",
              px: 0.5,
              py: 0.25,
              borderRadius: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
            }}
          >
            {player.goals > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <SportsSoccer sx={{ fontSize: "0.75rem", color: "success.main" }} />
                <Typography variant="caption" fontWeight="bold" color="success.main" fontSize="0.65rem">
                  {player.goals}
                </Typography>
              </Box>
            )}
            {player.assists > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <img src={AssistIcon} style={{ width: 10, height: 10 }} alt="assist" />
                <Typography variant="caption" fontWeight="bold" color="info.main" fontSize="0.65rem">
                  {player.assists}
                </Typography>
              </Box>
            )}
            {player.ownGoals > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                <SportsSoccer sx={{ fontSize: "0.75rem", color: "error.main" }} />
                <Typography variant="caption" fontWeight="bold" color="error.main" fontSize="0.65rem">
                  {player.ownGoals}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  };

  const currentPlayers = selectedTeam === 0 ? team1Players : team2Players;

  return (
    <Box sx={{ width: "100%", bgcolor: "grey.50", borderRadius: 2, overflow: "hidden" }}>
      {/* Tabs para cambiar de equipo */}
      <Tabs
        value={selectedTeam}
        onChange={handleTeamChange}
        variant="fullWidth"
        sx={{
          bgcolor: "white",
          "& .MuiTab-root": {
            fontWeight: "bold",
            fontSize: "0.875rem",
          },
        }}
      >
        <Tab label="Equipo 1" />
        <Tab label="Equipo 2" />
      </Tabs>

      {/* Campo de fútbol */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "140%", // Aspect ratio para campo vertical
          background: "linear-gradient(180deg, #4CAF50 0%, #45a049 50%, #4CAF50 100%)",
          overflow: "hidden",
        }}
      >
        {/* Líneas del campo */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        >
          {/* Línea central */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "5%",
              right: "5%",
              height: 2,
              bgcolor: "rgba(255,255,255,0.4)",
            }}
          />

          {/* Círculo central */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          />

          {/* Área superior (ataque) */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "20%",
              right: "20%",
              height: "18%",
              border: "2px solid rgba(255,255,255,0.4)",
              borderTop: "none",
            }}
          />

          {/* Área pequeña superior */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "35%",
              right: "35%",
              height: "8%",
              border: "2px solid rgba(255,255,255,0.4)",
              borderTop: "none",
            }}
          />

          {/* Área inferior (defensa) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "20%",
              right: "20%",
              height: "18%",
              border: "2px solid rgba(255,255,255,0.4)",
              borderBottom: "none",
            }}
          />

          {/* Área pequeña inferior */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "35%",
              right: "35%",
              height: "8%",
              border: "2px solid rgba(255,255,255,0.4)",
              borderBottom: "none",
            }}
          />

          {/* Borde del campo */}
          <Box
            sx={{
              position: "absolute",
              top: "2%",
              left: "5%",
              right: "5%",
              bottom: "2%",
              border: "2px solid rgba(255,255,255,0.4)",
            }}
          />
        </Box>

        {/* Jugadores */}
        {currentPlayers.map((player, index) => renderPlayer(player, index))}
      </Box>
    </Box>
  );
};

export default MatchLineup;
