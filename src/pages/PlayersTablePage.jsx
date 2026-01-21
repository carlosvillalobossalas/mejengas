import {
  Box,
  Grid2,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Avatar,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  Button,
  Fade,
} from "@mui/material";
import { SportsSoccer, Stadium, Stars, Person, ShowChart, Analytics, CalendarMonth } from "@mui/icons-material";
import AssistIcon from "/assets/shoe.png";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPlayersSeasonStats } from "../firebase/playerEndpoints";
import { getPlayerDisplay } from "../utils/playersDisplayName";
import { useSelector } from "react-redux";
import { selectActiveGroupId } from "../store/slices/groupsSlice";

// Función para combinar stats de PlayerSeasonStats con datos de jugadores
const preparePlayerStatsFromSeasonStats = async (players, groupId) => {
  try {
    // Obtener todas las estadísticas de PlayerSeasonStats agrupadas por temporada
    const statsBySeason = await getAllPlayersSeasonStats(groupId);

    const stats = {
      historico: [],
      2025: [],
      2026: [],
    };

    // Calcular histórico total para cada jugador
    const historicTotals = {};

    Object.keys(statsBySeason).forEach(season => {
      statsBySeason[season].forEach(stat => {
        if (!historicTotals[stat.playerId]) {
          historicTotals[stat.playerId] = {
            id: stat.playerId,
            goals: 0,
            assists: 0,
            matches: 0,
            won: 0,
            draw: 0,
            lost: 0,
          };
        }

        historicTotals[stat.playerId].goals += stat.goals || 0;
        historicTotals[stat.playerId].assists += stat.assists || 0;
        historicTotals[stat.playerId].matches += stat.matches || 0;
        historicTotals[stat.playerId].won += stat.won || 0;
        historicTotals[stat.playerId].draw += stat.draw || 0;
        historicTotals[stat.playerId].lost += stat.lost || 0;
      });
    });

    // Convertir histórico a array y combinar con datos de jugadores
    stats.historico = Object.values(historicTotals).map(stat => {
      const fullPlayer = players.find(p => p.id === stat.id);
      return {
        ...stat,
        name: fullPlayer?.name,
        photoURL: fullPlayer?.photoURL,
        originalName: fullPlayer?.originalName,
        userId: fullPlayer?.userId,
      };
    });

    // Para cada año específico, combinar con datos de jugadores
    [2025, 2026].forEach(year => {
      if (statsBySeason[year]) {
        stats[year] = statsBySeason[year].map(stat => {
          const fullPlayer = players.find(p => p.id === stat.playerId);
          return {
            id: stat.playerId,
            goals: stat.goals || 0,
            assists: stat.assists || 0,
            matches: stat.matches || 0,
            won: stat.won || 0,
            draw: stat.draw || 0,
            lost: stat.lost || 0,
            name: fullPlayer?.name,
            photoURL: fullPlayer?.photoURL,
            originalName: fullPlayer?.originalName,
            userId: fullPlayer?.userId,
          };
        });
      }
    });

    return stats;
  } catch (error) {
    console.error("Error preparing player stats:", error);
    return { historico: [], 2025: [], 2026: [] };
  }
};

export const PlayersTablePage = ({ players }) => {
  const activeGroupId = useSelector(selectActiveGroupId);
  const [orderBy, setOrderBy] = useState("goals");
  const [order, setOrder] = useState("desc");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [allYearStats, setAllYearStats] = useState({ historico: [], 2025: [], 2026: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const navigate = useNavigate();

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleRowClick = (player) => {
    // Si el jugador ya está seleccionado, deseleccionar
    if (selectedPlayer?.id === player.id) {
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(player);
    }
  };

  // Cargar stats desde PlayerSeasonStats cuando cambia el grupo o los jugadores
  useEffect(() => {
    const loadStats = async () => {
      if (!activeGroupId) return;

      setIsLoading(true);
      setAllYearStats({ historico: [], 2025: [], 2026: [] });
      setSelectedPlayer(null);

      const stats = await preparePlayerStatsFromSeasonStats(players, activeGroupId);
      setAllYearStats(stats);
      setIsLoading(false);
    };

    loadStats();
  }, [players, activeGroupId]);

  // Obtener los jugadores del año seleccionado
  const currentYearPlayers = allYearStats[selectedYear] || [];

  const sortedPlayers = [...currentYearPlayers].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Para promedios calculados
    if (orderBy === "goalsPerMatch") {
      aValue = a.matches > 0 ? a.goals / a.matches : 0;
      bValue = b.matches > 0 ? b.goals / b.matches : 0;
    } else if (orderBy === "assistsPerMatch") {
      aValue = a.matches > 0 ? a.assists / a.matches : 0;
      bValue = b.matches > 0 ? b.assists / b.matches : 0;
    } else if (orderBy === "goalsAndAssists") {
      aValue = a.goals + a.assists;
      bValue = b.goals + b.assists;
    }

    if (orderBy === "name") {
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return order === "asc" ? aValue - bValue : bValue - aValue;
  });

  return (
    <Grid2
      container
      flexDirection="column"
      sx={{
        height: "100%",
        overflow: "hidden",
        bgcolor: "grey.50",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 1.5,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6" textAlign="center" fontWeight="bold">
          ⚽ Jugadores
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: 1 }}>
          <FormControl size="small" sx={{ minWidth: { xs: 160, sm: 200 } }}>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              startAdornment={<CalendarMonth sx={{ fontSize: "1.2rem" }} />}

              sx={{
                bgcolor: "white",
                borderRadius: 2,
                fontWeight: 500,
                "& .MuiSelect-select": {
                  py: 0.75,
                  px: 1.5,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.light",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: 2,
                },
              }}
            >
              <MenuItem value="historico" sx={{ fontWeight: 500 }}>Record Histórico</MenuItem>
              <MenuItem value="2025" sx={{ fontWeight: 500 }}>2025</MenuItem>
              <MenuItem value="2026" sx={{ fontWeight: 500 }}>2026</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Typography variant="caption" textAlign="center" display="block" sx={{ mt: 1 }}>
          Total: {currentYearPlayers.length} jugadores
        </Typography>
      </Box>

      {/* Tabla */}
      <Box sx={{ flex: 1, overflow: "auto", width: "100%" }}>
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table size="small" sx={{ minWidth: 650 }}>

            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    px: { xs: 0.5, sm: 1 },
                    py: { xs: 1, sm: 1.5 },
                    width: { xs: 10, sm: 60 },
                  }}
                >
                  <Tooltip title="Posición" arrow>
                    <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>#</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    px: { xs: 0, sm: 1 },
                    py: { xs: 1, sm: 1.5 },
                    width: { xs: 50, sm: 150 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleSort("name")}
                    hideSortIcon
                    sx={{
                      color: "white !important",
                      "&:hover": { color: "white !important" },
                    }}
                  >
                    Jugador
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    px: { xs: 0.1, sm: 0.2 },
                    py: { xs: 1, sm: 1.5 },
                    width: { xs: 45, sm: 60 },
                  }}
                >
                  <Tooltip title="Goles" arrow>
                    <TableSortLabel
                      active={orderBy === "goals"}
                      direction={orderBy === "goals" ? order : "asc"}
                      onClick={() => handleSort("goals")}
                      hideSortIcon
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      <SportsSoccer sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 0.1, sm: 0.2 },
                    width: { xs: 45, sm: 60 },
                  }}
                >
                  <Tooltip title="Asistencias" arrow>
                    <TableSortLabel
                      active={orderBy === "assists"}
                      direction={orderBy === "assists" ? order : "asc"}
                      onClick={() => handleSort("assists")}
                      hideSortIcon
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      <img
                        src={AssistIcon}
                        style={{ width: "20px", height: "20px" }}
                      />
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 0.1, sm: 0.2 },
                    width: { xs: 45, sm: 60 },
                  }}
                >
                  <Tooltip title="Goles + Asistencias" arrow>
                    <TableSortLabel
                      active={orderBy === "goalsAndAssists"}
                      direction={orderBy === "goalsAndAssists" ? order : "asc"}
                      onClick={() => handleSort("goalsAndAssists")}
                      hideSortIcon
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      <Stars sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 0.1, sm: 0.2 },
                    width: { xs: 45, sm: 60 },
                  }}
                >
                  <Tooltip title="Partidos Jugados" arrow>
                    <TableSortLabel
                      active={orderBy === "matches"}
                      direction={orderBy === "matches" ? order : "asc"}
                      onClick={() => handleSort("matches")}
                      hideSortIcon
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      <Stadium sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 0.1, sm: 0.2 },
                    width: { xs: 50, sm: 65 },
                  }}
                >
                  <Tooltip title="Goles por Partido" arrow>
                    <TableSortLabel
                      active={orderBy === "goalsPerMatch"}
                      direction={orderBy === "goalsPerMatch" ? order : "asc"}
                      onClick={() => handleSort("goalsPerMatch")}
                      hideSortIcon
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      GxP
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    px: { xs: 0.1, sm: 0.2 },
                    width: { xs: 50, sm: 65 },
                  }}
                >
                  <Tooltip title="Asistencias por Partido" arrow>
                    <TableSortLabel
                      active={orderBy === "assistsPerMatch"}
                      direction={orderBy === "assistsPerMatch" ? order : "asc"}
                      onClick={() => handleSort("assistsPerMatch")}
                      hideSortIcon
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      AxP
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPlayers.map((player, index) => {
                const goalsPerMatch = player.matches > 0 ? (player.goals / player.matches).toFixed(2) : "0.00";
                const assistsPerMatch = player.matches > 0 ? (player.assists / player.matches).toFixed(2) : "0.00";

                return (
                  <TableRow
                    key={player.id}
                    onClick={() => handleRowClick(player)}
                    sx={{
                      bgcolor: selectedPlayer?.id === player.id
                        ? "primary.main"
                        : index % 2 === 0
                          ? "grey.50"
                          : "white",
                      "&:hover": {
                        bgcolor: selectedPlayer?.id === player.id
                          ? "primary.dark"
                          : "primary.light",
                        cursor: "pointer",
                      },
                      transition: "background-color 0.2s",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: selectedPlayer?.id === player.id ? "white" : index < 3 ? "primary.main" : "text.primary",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        maxWidth: { xs: 10, sm: 60 },
                      }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: index < 3 ? "bold" : "normal",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        maxWidth: { xs: 70, sm: 150 },
                        color: selectedPlayer?.id === player.id ? "white" : "inherit",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar
                          src={player.photoURL}
                          alt={getPlayerDisplay(player)}
                          sx={{ width: { xs: 24, sm: 32 }, height: { xs: 24, sm: 32 } }}
                        >
                          {getPlayerDisplay(player)?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          }}
                        >
                          {getPlayerDisplay(player)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: selectedPlayer?.id === player.id ? "white" : "success.main",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.1, sm: 0.2 },
                        py: { xs: 0.5, sm: 1 },
                        width: { xs: 45, sm: 60 },
                      }}
                    >
                      {player.goals}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: selectedPlayer?.id === player.id ? "white" : "info.main",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.1, sm: 0.2 },
                        py: { xs: 0.5, sm: 1 },
                        width: { xs: 45, sm: 60 },
                      }}
                    >
                      {player.assists}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: selectedPlayer?.id === player.id ? "white" : "warning.main",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.1, sm: 0.2 },
                        py: { xs: 0.5, sm: 1 },
                        width: { xs: 45, sm: 60 },
                      }}
                    >
                      {player.goals + player.assists}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.1, sm: 0.2 },
                        py: { xs: 0.5, sm: 1 },
                        width: { xs: 45, sm: 60 },
                        color: selectedPlayer?.id === player.id ? "white" : "inherit",
                      }}
                    >
                      {player.matches}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.1, sm: 0.2 },
                        py: { xs: 0.5, sm: 1 },
                        width: { xs: 50, sm: 65 },
                        color: selectedPlayer?.id === player.id ? "white" : "inherit",
                      }}
                    >
                      {goalsPerMatch}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.1, sm: 0.2 },
                        py: { xs: 0.5, sm: 1 },
                        width: { xs: 50, sm: 65 },
                        color: selectedPlayer?.id === player.id ? "white" : "inherit",
                      }}
                    >
                      {assistsPerMatch}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Botón flotante para ver perfil */}
      <Fade in={selectedPlayer !== null}>
        <Box
          sx={{
            position: "absolute",
            right: 10,
            bottom: 10,
            zIndex: 1000,
            width: 300,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate(`/perfil/${selectedPlayer?.id}`)}
            sx={{
              boxShadow: 4,
              width: "100%",
              "&:hover": {
                boxShadow: 8,
              },
            }}
          >
            <Typography
              sx={{
                width: '100%',
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontSize: 14
              }}
            >
              Ver Perfil de {getPlayerDisplay(selectedPlayer)}
            </Typography>
          </Button>
        </Box>
      </Fade>
    </Grid2>
  );
};
