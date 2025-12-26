import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid2,
  Button,
} from "@mui/material";
import { getBallonDeOroResults, getAllPlayers } from "../firebase/endpoints";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function BallonDeOroResults() {
  const [results, setResults] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllPlayers(setPlayers);

    const fetchResults = async () => {
      try {
        const data = await getBallonDeOroResults();
        setResults(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const getPlayerName = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player?.name);
    if (!isEmail && player?.name) {
      return player.name;
    }
    return player?.originalName || player?.name || "Desconocido";
  };

  const getMedalColor = (position) => {
    switch (position) {
      case 0:
        return "#FFD700";
      case 1:
        return "#C0C0C0";
      case 2:
        return "#CD7F32";
      default:
        return "#9E9E9E";
    }
  };

  const createRanking = (playerPoints) =>
    Object.entries(playerPoints)
      .map(([playerId, points]) => ({
        playerId,
        points,
        name: getPlayerName(playerId),
      }))
      .sort((a, b) => b.points - a.points);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!results) {
    return (
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/balon-de-oro")}>
          Volver
        </Button>
        <Typography variant="h5" align="center" color="error">
          Error cargando los resultados
        </Typography>
      </Container>
    );
  }

  const ranking = createRanking(results.playerPoints);
  const [gold, silver, bronze] = ranking;

  return (
    <Box sx={{ py: 2, bgcolor: "grey.50", height: "100vh", overflow: "auto" }}>
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          mb={1}
          color="primary.main"
        >
          🏆 Balón de Oro 2025
        </Typography>

        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          mb={4}
        >
          Total de votos: {results.totalVotes}
        </Typography>

        {/* 🥇🥈🥉 PODIO */}
        <Box mb={5}>
          <Grid2 container spacing={1} alignItems="flex-end" justifyContent="center">
            {silver && (
              <Grid2 xs={12} md={3}>
                <Card sx={{ bgcolor: getMedalColor(1), height: 180 }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h4">🥈</Typography>
                    <Typography fontWeight={700}>{silver.name}</Typography>
                    <Chip label={`${silver.points} pts`} size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid2>
            )}

            {gold && (
              <Grid2 xs={12} md={4}>
                <Card
                  sx={{
                    bgcolor: getMedalColor(0),
                    height: 240,
                    boxShadow: "0 12px 30px rgba(255,215,0,0.5)",
                  }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h3">🥇</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {gold.name}
                    </Typography>
                    <Chip
                      label={`${gold.points} puntos`}
                      sx={{ mt: 2, fontWeight: 700 }}
                    />
                  </CardContent>
                </Card>
              </Grid2>
            )}

            {bronze && (
              <Grid2 xs={12} md={3}>
                <Card sx={{ bgcolor: getMedalColor(2), height: 150 }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h5">🥉</Typography>
                    <Typography fontWeight={700}>{bronze.name}</Typography>
                    <Chip label={`${bronze.points} pts`} size="small" sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid2>
            )}
          </Grid2>
        </Box>

        {/* 📊 RANKING GENERAL (SCROLL DE LA PÁGINA) */}
        <Box mb={4} pb={2}>
          <Typography variant="h6" fontWeight={700} mb={2} color="primary.main">
            📊 Ranking General
          </Typography>

          <Paper sx={{ p: 2 }}>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {ranking.map((player, index) => (
                <Box
                  key={player.playerId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.5,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    borderLeft: `4px solid ${getMedalColor(index)}`,
                  }}
                >
                  <Typography fontWeight={700} minWidth={40}>
                    #{index + 1}
                  </Typography>

                  <Typography sx={{ flexGrow: 1 }}>
                    {player.name}
                  </Typography>

                  <Chip
                    label={`${player.points} ptos`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

      </Container>
    </Box>
  );
}

export default BallonDeOroResults;
