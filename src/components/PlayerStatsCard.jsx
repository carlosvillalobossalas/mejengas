import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import AssistantIcon from "@mui/icons-material/Assistant";
import SportsIcon from "@mui/icons-material/Sports";

function PlayerStatsCard({ playerData, seasonStats, awards }) {
  const getMedalEmoji = (position) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏆";
    }
  };

  const getMedalColor = (position) => {
    switch (position) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return "#9E9E9E";
    }
  };

  const currentYear = new Date().getFullYear();
  
  // Filtrar y ordenar temporadas desde 2025 en adelante
  const seasonsToShow = seasonStats
    ?.filter((s) => s.season >= 2025)
    .sort((a, b) => a.season - b.season) || [];

  // Calcular histórico total desde las temporadas
  const historicTotals = seasonStats?.reduce(
    (acc, season) => ({
      goals: acc.goals + season.goals,
      assists: acc.assists + season.assists,
      matches: acc.matches + season.matches,
      won: acc.won + season.won,
      draw: acc.draw + season.draw,
      lost: acc.lost + season.lost,
    }),
    { goals: 0, assists: 0, matches: 0, won: 0, draw: 0, lost: 0 }
  ) || { goals: 0, assists: 0, matches: 0, won: 0, draw: 0, lost: 0 };

  return (
    <Box sx={{ pb: 5 }}>
      {/* Premios */}
      {awards && awards.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <EmojiEventsIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              Premios
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {awards.map((award, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  bgcolor: "grey.50",
                  borderRadius: 1.5,
                  borderLeft: `4px solid ${getMedalColor(award.position)}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6">
                    {getMedalEmoji(award.position)}
                  </Typography>
                  <Box>
                    <Typography fontWeight={700} fontSize="0.95rem">{award.award}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Año {award.year}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Estadísticas Totales */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
          📊 Histórico Total
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
          <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1.5 }}>
            <SportsScoreIcon sx={{ fontSize: 28, color: "primary.main", mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700}>
              {historicTotals.goals}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Goles
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1.5 }}>
            <AssistantIcon sx={{ fontSize: 28, color: "success.main", mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700}>
              {historicTotals.assists}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Asistencias
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1.5 }}>
            <SportsIcon sx={{ fontSize: 28, color: "info.main", mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700}>
              {historicTotals.matches}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Partidos
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1.5 }}>
            <EmojiEventsIcon sx={{ fontSize: 28, color: "warning.main", mb: 0.5 }} />
            <Typography variant="h5" fontWeight={700}>
              {historicTotals.won}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Victorias
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Estadísticas por cada temporada desde 2025 */}
      {seasonsToShow.map((season) => (
        <Paper key={season.id} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            {season.season === currentYear ? `🔥 Temporada ${season.season} (Actual)` : `📅 Temporada ${season.season}`}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
            <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="primary">
                {season.goals}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Goles
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {season.assists}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Asistencias
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="info.main">
                {season.matches}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Partidos
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", p: 1.5, bgcolor: "grey.50", borderRadius: 1.5 }}>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {season.won}-{season.draw}-{season.lost}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                V-E-D
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default PlayerStatsCard;
