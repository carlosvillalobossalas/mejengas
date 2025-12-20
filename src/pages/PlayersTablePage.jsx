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
} from "@mui/material";
import { SportsSoccer, Stadium } from "@mui/icons-material";
import AssistIcon from "/assets/shoe.png";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const PlayersTablePage = ({ players }) => {
  const [orderBy, setOrderBy] = useState("goals");
  const [order, setOrder] = useState("desc");
  const [users, setUsers] = useState({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersMap = {};
        usersSnapshot.docs.forEach((doc) => {
          usersMap[doc.id] = doc.data();
        });
        setUsers(usersMap);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  const getPlayerDisplayName = (player) => {
    if (player.userId && users[player.userId]?.displayName) {
      return users[player.userId].displayName;
    }
    return player.name;
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Para promedios calculados
    if (orderBy === "goalsPerMatch") {
      aValue = a.matches > 0 ? a.goals / a.matches : 0;
      bValue = b.matches > 0 ? b.goals / b.matches : 0;
    } else if (orderBy === "assistsPerMatch") {
      aValue = a.matches > 0 ? a.assists / a.matches : 0;
      bValue = b.matches > 0 ? b.assists / b.matches : 0;
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
        <Typography variant="caption" textAlign="center" display="block">
          Total: {players.length} jugadores
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
                    px: { xs: 0.5, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                  }}
                >
                  Pos
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                    px: { xs: 0.5, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={() => handleSort("name")}
                    sx={{
                      color: "white !important",
                      "&:hover": { color: "white !important" },
                      "& .MuiTableSortLabel-icon": { color: "white !important" },
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
                    px: { xs: 0.5, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === "goals"}
                    direction={orderBy === "goals" ? order : "asc"}
                    onClick={() => handleSort("goals")}
                    sx={{
                      color: "white !important",
                      "&:hover": { color: "white !important" },
                      "& .MuiTableSortLabel-icon": { color: "white !important" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      <SportsSoccer sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                      <span>Goles</span>
                    </Box>
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === "assists"}
                    direction={orderBy === "assists" ? order : "asc"}
                    onClick={() => handleSort("assists")}
                    sx={{
                      color: "white !important",
                      "&:hover": { color: "white !important" },
                      "& .MuiTableSortLabel-icon": { color: "white !important" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      <img
                        src={AssistIcon}
                        style={{ width: "16px" }}
                      />
                      <span>Asist.</span>
                    </Box>
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === "matches"}
                    direction={orderBy === "matches" ? order : "asc"}
                    onClick={() => handleSort("matches")}
                    sx={{
                      color: "white !important",
                      "&:hover": { color: "white !important" },
                      "& .MuiTableSortLabel-icon": { color: "white !important" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      <Stadium sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                      <span>Partidos</span>
                    </Box>
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === "goalsPerMatch"}
                    direction={orderBy === "goalsPerMatch" ? order : "asc"}
                    onClick={() => handleSort("goalsPerMatch")}
                    sx={{
                      color: "white !important",
                      "&:hover": { color: "white !important" },
                      "& .MuiTableSortLabel-icon": { color: "white !important" },
                    }}
                  >
                    G/P
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  <TableSortLabel
                    active={orderBy === "assistsPerMatch"}
                    direction={orderBy === "assistsPerMatch" ? order : "asc"}
                    onClick={() => handleSort("assistsPerMatch")}
                    sx={{
                      color: "white !important",
                      "&:hover": { color: "white !important" },
                      "& .MuiTableSortLabel-icon": { color: "white !important" },
                    }}
                  >
                    A/P
                  </TableSortLabel>
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
                      }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: index < 3 ? "bold" : "normal",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getPlayerDisplayName(player)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "success.main",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
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
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {player.assists}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ 
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {player.matches}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {goalsPerMatch}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
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
