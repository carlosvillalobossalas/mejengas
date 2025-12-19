import {
  EmojiEvents,
  SportsSoccer,
  Shield,
  TrendingUp,
  Sports,
  Star,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Grid2,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getSeasonSummary, getAllSeasonSummaries } from "../firebase/endpoints";

const SeasonSummaryPage = () => {
  const [summary, setSummary] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener todos los años disponibles
    const unsubscribeYears = getAllSeasonSummaries((summaries) => {
      const years = summaries.map((s) => parseInt(s.year));
      setAvailableYears(years);
      
      // Si el año seleccionado no existe, seleccionar el más reciente
      if (years.length > 0 && !years.includes(selectedYear)) {
        setSelectedYear(years[0]);
      }
    });

    return () => {
      if (typeof unsubscribeYears === 'function') {
        unsubscribeYears();
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = getSeasonSummary(selectedYear, (data) => {
      if (data) {
        setSummary(data);
        setError(null);
      } else {
        setSummary(null);
        setError(`No hay datos disponibles para la temporada ${selectedYear}`);
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [selectedYear]);

  const StatCard = ({ title, value, subtitle, icon, color = "primary" }) => (
    <Card sx={{ 
      height: "100%", 
      bgcolor: `${color}.main`,
      color: 'white',
      minHeight: { xs: '120px', sm: '140px' }
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box sx={{ flex: 1, pr: 1 }}>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="inherit"
              sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              color="inherit" 
              sx={{ 
                opacity: 0.9,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                color="inherit" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  display: 'block'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ opacity: 0.7, fontSize: { xs: 30, sm: 35, md: 40 } }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  const PlayerHighlight = ({ title, player, stat, icon }) => {
    if (!player) return null;

    return (
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} sx={{ flex: 1 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{icon}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {title}
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}
              >
                {player.name}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={stat} 
            color="primary" 
            size="small"
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.8125rem' },
              height: { xs: '24px', sm: '32px' }
            }}
          />
        </Box>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 }, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={2}>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            display="flex" 
            alignItems="center" 
            gap={1}
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' } }}
          >
            <EmojiEvents sx={{ fontSize: { xs: 30, sm: 35, md: 40 }, color: "gold" }} />
            Resumen de Temporada
          </Typography>
          <FormControl sx={{ minWidth: { xs: 100, sm: 120 } }}>
            <InputLabel>Año</InputLabel>
            <Select
              value={selectedYear}
              label="Año"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Divider />
      </Box>

      {error ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          {error}
          <br />
          <Typography variant="caption">
            Los resúmenes se generan automáticamente al registrar partidos.
          </Typography>
        </Alert>
      ) : summary ? (
          <>
            {/* Stats Overview */}
            <Grid2 container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Partidos Jugados"
                  value={summary.totalMatches}
                  icon={<Sports sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />}
                  color="primary"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Goles Totales"
                  value={summary.totalGoals}
                  subtitle={`Promedio: ${(summary.totalGoals / summary.totalMatches).toFixed(1)} por partido`}
                  icon={<SportsSoccer sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />}
                  color="success"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Goleador"
                  value={summary.topScorer?.name || "N/A"}
                  subtitle={`${summary.topScorer?.goals || 0} goles`}
                  icon={<EmojiEvents sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />}
                  color="warning"
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Más Asistencias"
                  value={summary.topAssister?.name || "N/A"}
                  subtitle={`${summary.topAssister?.assists || 0} asistencias`}
                  icon={<Star sx={{ fontSize: { xs: 30, sm: 35, md: 40 } }} />}
                  color="info"
                />
              </Grid2>
            </Grid2>

            {/* Destacados */}
            <Grid2 container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  mb={2}
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                >
                  🏆 Destacados Ofensivos
                </Typography>
                <PlayerHighlight
                  title="Mejor Promedio de Goles"
                  player={summary.bestGoalsPerMatch}
                  stat={`${summary.bestGoalsPerMatch?.goalsPerMatch} goles/partido`}
                  icon={<TrendingUp color="success" />}
                />
                <PlayerHighlight
                  title="Mejor Promedio de Asistencias"
                  player={summary.bestAssistsPerMatch}
                  stat={`${summary.bestAssistsPerMatch?.assistsPerMatch} asist/partido`}
                  icon={<TrendingUp color="info" />}
                />
                <PlayerHighlight
                  title="Más Partidos Jugados"
                  player={summary.mostGamesPlayed}
                  stat={`${summary.mostGamesPlayed?.matches} partidos`}
                  icon={<Sports color="primary" />}
                />
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  mb={2}
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                >
                  🧤 Destacados Porteros
                </Typography>
                <PlayerHighlight
                  title="Mejor Promedio (Menos Goles Recibidos)"
                  player={summary.gkBestAverage}
                  stat={`${summary.gkBestAverage?.goalsReceivedPerMatch} goles/partido`}
                  icon={<Shield color="success" />}
                />
                <PlayerHighlight
                  title="Más Vallas Invictas"
                  player={summary.gkMostCleanSheets}
                  stat={`${summary.gkMostCleanSheets?.cleanSheets} vallas`}
                  icon={<Shield color="warning" />}
                />
                <PlayerHighlight
                  title="Mejor % Vallas Invictas"
                  player={summary.gkBestCleanSheetRate}
                  stat={`${summary.gkBestCleanSheetRate?.cleanSheetRate}%`}
                  icon={<TrendingUp color="info" />}
                />
              </Grid2>
            </Grid2>

            {/* Top Goleadores Table */}
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                mb={2}
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                ⚽ Top 10 Goleadores
              </Typography>
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size={{ xs: 'small', sm: 'medium' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "primary.main" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Pos</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Jugador</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} align="center">Goles</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }} align="center">Partidos</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} align="center">Prom.</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }} align="center">Asist.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.allPlayerStats?.slice(0, 10).map((player, index) => (
                      <TableRow
                        key={player.id}
                        sx={{
                          bgcolor: index % 2 === 0 ? "grey.50" : "white",
                          "&:hover": { bgcolor: "grey.100" },
                        }}
                      >
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {index === 0 && "🥇"}
                          {index === 1 && "🥈"}
                          {index === 2 && "🥉"}
                          {index > 2 && index + 1}
                        </TableCell>
                        <TableCell fontWeight={index < 3 ? "bold" : "normal"} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {player.name}
                        </TableCell>
                        <TableCell align="center" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {player.goals}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{player.matches}</TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{player.goalsPerMatch}</TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{player.assists}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Top Asistencias */}
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                mb={2}
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                👟 Top 10 Asistencias
              </Typography>
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size={{ xs: 'small', sm: 'medium' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "info.main" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Pos</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Jugador</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} align="center">Asist.</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }} align="center">Partidos</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} align="center">Prom.</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }} align="center">Goles</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.allPlayerStats
                      ?.sort((a, b) => b.assists - a.assists)
                      .slice(0, 10)
                      .map((player, index) => (
                        <TableRow
                          key={player.id}
                          sx={{
                            bgcolor: index % 2 === 0 ? "grey.50" : "white",
                            "&:hover": { bgcolor: "grey.100" },
                          }}
                        >
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && index + 1}
                          </TableCell>
                          <TableCell fontWeight={index < 3 ? "bold" : "normal"} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {player.name}
                          </TableCell>
                          <TableCell align="center" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {player.assists}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{player.matches}</TableCell>
                          <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{player.assistsPerMatch}</TableCell>
                          <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{player.goals}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Tabla de Porteros */}
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                mb={2}
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                🧤 Estadísticas de Porteros
              </Typography>
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size={{ xs: 'small', sm: 'medium' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "success.main" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Portero</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }} align="center">Partidos</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }} align="center">Goles Rec.</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} align="center">Prom.</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} align="center">Vallas</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }} align="center">% Vallas</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }} align="center">Victorias</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.allGKStats?.map((gk, index) => (
                      <TableRow
                        key={gk.id}
                        sx={{
                          bgcolor: index % 2 === 0 ? "grey.50" : "white",
                          "&:hover": { bgcolor: "grey.100" },
                        }}
                      >
                        <TableCell fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{gk.name}</TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{gk.matches}</TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>{gk.goalsReceived}</TableCell>
                        <TableCell align="center" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {gk.goalsReceivedPerMatch}
                        </TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{gk.cleanSheets}</TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{gk.cleanSheetRate}%</TableCell>
                        <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>{gk.won}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Mejores % Victorias */}
            <Box>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                mb={2}
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
              >
                🏆 Mejores % de Victorias (Mín. 3 partidos)
              </Typography>
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size={{ xs: 'small', sm: 'medium' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "warning.main" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Pos</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Jugador</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} align="center">Vict.</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }} align="center">Emp.</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }} align="center">Derr.</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }} align="center">Partidos</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }} align="center">% Vict.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.allPlayerStats
                      ?.filter((p) => p.matches >= 3)
                      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
                      .slice(0, 10)
                      .map((player, index) => (
                        <TableRow
                          key={player.id}
                          sx={{
                            bgcolor: index % 2 === 0 ? "grey.50" : "white",
                            "&:hover": { bgcolor: "grey.100" },
                          }}
                        >
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
                            {index > 2 && index + 1}
                          </TableCell>
                          <TableCell fontWeight={index < 3 ? "bold" : "normal"} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {player.name}
                          </TableCell>
                          <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{player.won}</TableCell>
                          <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{player.draw}</TableCell>
                          <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', sm: 'table-cell' } }}>{player.lost}</TableCell>
                          <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, display: { xs: 'none', md: 'table-cell' } }}>{player.matches}</TableCell>
                          <TableCell align="center" fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {player.winRate}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        ) : null}
      </Container>
    );
};

export default SeasonSummaryPage;
