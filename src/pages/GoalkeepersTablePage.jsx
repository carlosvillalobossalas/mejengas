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
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import ShieldIcon from "@mui/icons-material/Shield";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Stadium from "@mui/icons-material/Stadium";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const GoalkeepersTablePage = ({ goalkeepers }) => {
  const [orderBy, setOrderBy] = useState("cleanSheet");
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

  const getGoalkeeperDisplayName = (gk) => {
    if (gk.userId && users[gk.userId]?.displayName) {
      return users[gk.userId].displayName;
    }
    return gk.name;
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedGoalkeepers = [...goalkeepers].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    // Para promedios calculados
    if (orderBy === "goalsPerMatch") {
      aValue = a.matches > 0 ? a.goals / a.matches : 0;
      bValue = b.matches > 0 ? b.goals / b.matches : 0;
    } else if (orderBy === "cleanSheetPercent") {
      aValue = a.matches > 0 ? (a.cleanSheet / a.matches) * 100 : 0;
      bValue = b.matches > 0 ? (b.cleanSheet / b.matches) * 100 : 0;
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
          bgcolor: "success.main",
          color: "white",
        }}
      >
        <Typography variant="h6" textAlign="center" fontWeight="bold">
          🧤 Porteros
        </Typography>
        <Typography variant="caption" textAlign="center" display="block">
          Total: {goalkeepers.length} porteros
        </Typography>
      </Box>

      {/* Tabla */}
      <Box sx={{ flex: 1, overflow: "auto", width: "100%" }}>
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table size="small" sx={{ minWidth: 700 }}>

            <TableHead>
              <TableRow sx={{ bgcolor: "success.main" }}>
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
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
                    Portero
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
                    active={orderBy === "cleanSheet"}
                    direction={orderBy === "cleanSheet" ? order : "asc"}
                    onClick={() => handleSort("cleanSheet")}
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
                      <ShieldIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                      <span>Vallas</span>
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
                      <SportsSoccerIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                      <span>Recib.</span>
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
                    active={orderBy === "won"}
                    direction={orderBy === "won" ? order : "asc"}
                    onClick={() => handleSort("won")}
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
                      <EmojiEventsIcon sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }} />
                      <span>Ganados</span>
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
                    R/P
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
                    active={orderBy === "cleanSheetPercent"}
                    direction={orderBy === "cleanSheetPercent" ? order : "asc"}
                    onClick={() => handleSort("cleanSheetPercent")}
                    sx={{
                      color: "white !important",
                      "&:hover": { color: "white !important" },
                      "& .MuiTableSortLabel-icon": { color: "white !important" },
                    }}
                  >
                    % Vallas
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedGoalkeepers.map((gk, index) => {
                const goalsPerMatch = gk.matches > 0 ? (gk.goals / gk.matches).toFixed(2) : "0.00";
                const cleanSheetPercent = gk.matches > 0 ? ((gk.cleanSheet / gk.matches) * 100).toFixed(1) : "0.0";

                return (
                  <TableRow
                    key={gk.id}
                    sx={{
                      bgcolor: index % 2 === 0 ? "grey.50" : "white",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: index < 3 ? "success.main" : "text.primary",
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
                      {getGoalkeeperDisplayName(gk)}
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
                      {gk.cleanSheet}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "error.main",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {gk.goals}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "warning.main",
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {gk.won}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ 
                        fontSize: { xs: "0.7rem", sm: "0.875rem" },
                        px: { xs: 0.5, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                      }}
                    >
                      {gk.matches}
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
                      {cleanSheetPercent}%
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
