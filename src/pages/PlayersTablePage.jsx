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
} from "@mui/material";
import { SportsSoccer, Stadium, Stars, Person, ShowChart, Analytics, CalendarMonth } from "@mui/icons-material";
import AssistIcon from "/assets/shoe.png";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getPlayerDisplay } from "../utils/playersDisplayName";
import { calculateSeasonStats, filterMatchesByYear } from "../utils/seasonStats";
import { getAllMatches } from "../firebase/endpoints";

// Función para preparar stats de todos los años combinando con datos de jugadores
const preparePlayerStatsAllYears = (matches, players) => {
  const stats = {
    historico: [],
    2025: [],
    2026: [],
  };

  // Histórico: usar directamente los players props
  stats.historico = players;

  // Para cada año, calcular stats y combinar con datos de jugadores
  [2025, 2026].forEach(year => {
    const filteredMatches = filterMatchesByYear(matches, year);
    const seasonStats = calculateSeasonStats(filteredMatches);
    
    if (seasonStats?.allPlayerStats) {
      // Combinar stats del año con datos completos del jugador
      stats[year] = seasonStats.allPlayerStats.map(stat => {
        const fullPlayer = players.find(p => p.id === stat.id);
        return {
          ...stat,
          photoURL: fullPlayer?.photoURL,
          originalName: fullPlayer?.originalName,
          userId: fullPlayer?.userId,
        };
      });
    }
  });

  return stats;
};

export const PlayersTablePage = ({ players }) => {
  const [orderBy, setOrderBy] = useState("goals");
  const [order, setOrder] = useState("desc");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [allYearStats, setAllYearStats] = useState({ historico: [], 2025: [], 2026: [] });
  const [isLoading, setIsLoading] = useState(true);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Cargar matches y calcular stats una sola vez
  useEffect(() => {
    const unsubscribe = getAllMatches((matches) => {
      const stats = preparePlayerStatsAllYears(matches, players);
      setAllYearStats(stats);
      setIsLoading(false);
    });
    return () => unsubscribe;
  }, [players]);

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
              // startAdornment={<CalendarMonth sx={{ mr: 0.5, fontSize: "1.2rem" }} />}
              
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
                    sx={{
                      bgcolor: index % 2 === 0 ? "grey.50" : "white",
                      "&:hover": {
                        bgcolor: "primary.light",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: index < 3 ? "primary.main" : "text.primary",
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
                        color: "success.main",
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
                        color: "info.main",
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
                        color: "warning.main",
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
    </Grid2>
  );
};
