import { ExpandLess, ExpandMore, SportsSoccer } from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  Box,
  Collapse,
  Grid2,
  IconButton,
  ListItemButton,
  Tooltip,
  Typography,
  Card,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import AssistIcon from "/assets/shoe.png";
import { formatMatchSummary, shareToWhatsApp } from "../utils/whatsappShare";
import { getPlayerDisplay } from "../utils/playersDisplayName";
import MatchLineup from "./MatchLineup";
import MVPVoteModal from "./MVPVoteModal";
import { getPlayerByUserId, saveMVPVote, calculateAndSaveMVP } from "../firebase/endpoints";
import { auth } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

const HistoricMatchesList = ({ matches = [], players = [] }) => {
  const [openItems, setOpenItems] = useState({});
  const [mvpModalOpen, setMvpModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [user] = useAuthState(auth);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  // Cargar datos del jugador actual
  useEffect(() => {
    if (user?.uid) {
      getPlayerByUserId(user.uid).then(setCurrentPlayer);
    }
  }, [user]);

  // Calcular MVP para partidos que ya pasaron 24 horas
  useEffect(() => {
    matches.forEach((match) => {
      if (match.registeredDate && !match.mvpPlayerId) {
        const registeredDate = match.registeredDate.toDate();
        const now = new Date();
        const hoursDiff = (now - registeredDate) / (1000 * 60 * 60);

        // Si pasaron más de 24 horas, calcular MVP
        if (hoursDiff > 24) {
          calculateAndSaveMVP(match.id).catch(console.error);
        }
      }
    });
  }, [matches]);

  const handleClick = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleShareWhatsApp = (match, event) => {
    event.stopPropagation();
    const message = formatMatchSummary(match);
    shareToWhatsApp(message);
  };

  const handleOpenMVPVote = (match, event) => {
    event.stopPropagation();
    setSelectedMatch(match);
    setMvpModalOpen(true);
  };

  const handleCloseMVPVote = () => {
    setMvpModalOpen(false);
    setSelectedMatch(null);
  };

  const handleVote = async (playerId) => {
    if (!selectedMatch || !currentPlayer) return;

    try {
      await saveMVPVote(selectedMatch.id, currentPlayer.id, playerId);
      // La UI se actualizará automáticamente porque matches usa onSnapshot
    } catch (error) {
      console.error("Error saving MVP vote:", error);
      alert("Error al guardar el voto. Por favor intenta de nuevo.");
    }
  };

  const canVote = (match) => {
    if (!currentPlayer || !match) return { canVote: false };

    // Verificar si el partido tiene registeredDate
    if (!match.registeredDate) return { canVote: false };

    // Verificar si han pasado más de 24 horas
    const registeredDate = match.registeredDate.toDate();
    const now = new Date();
    const hoursDiff = (now - registeredDate) / (1000 * 60 * 60);
    if (hoursDiff > 24) return { canVote: false };

    // Verificar si el jugador participó en el partido
    const allMatchPlayers = [...(match.players1 || []), ...(match.players2 || [])];
    const playerInMatch = allMatchPlayers.find(p => p.id === currentPlayer.id);
    if (!playerInMatch) return { canVote: false };

    // Verificar si ya votó
    if (playerInMatch.mvpVote) {
      const votedPlayerInfo = players.find(p => p.id === playerInMatch.mvpVote);
      return {
        canVote: false,
        hasVoted: true,
        votedFor: getPlayerDisplay(votedPlayerInfo)
      };
    }

    return { canVote: true };
  };

  return (
    <Grid2
      container
      flexDirection="column"
      sx={{ height: "100%", overflow: "hidden", bgcolor: "grey.50" }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="caption" textAlign="center" display="block">
          Total: {matches.length} partidos
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 1, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {matches.map((match, index) => (
            <Card
              key={index}
              elevation={2}
              sx={{
                overflow: "hidden",
                transition: "all 0.3s",
                "&:hover": {
                  elevation: 4,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <ListItemButton
                onClick={() => handleClick(index)}
                sx={{
                  bgcolor: "white",
                  py: 2,
                  "&:hover": {
                    bgcolor: "grey.50",
                  },
                }}
              >
                <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                  {/* Fecha */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {match.date.toDate().toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Typography>
                  </Box>

                  {/* Resultado */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Equipo 1
                      </Typography>
                      <Chip
                        label={match.goalsTeam1}
                        color={match.goalsTeam1 > match.goalsTeam2 ? "success" : match.goalsTeam1 < match.goalsTeam2 ? "error" : "default"}
                        sx={{ fontWeight: "bold", fontSize: "1.2rem", height: 40, width: 50 }}
                      />
                    </Box>

                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h6" color="text.secondary" fontWeight="bold">
                        VS
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Equipo 2
                      </Typography>
                      <Chip
                        label={match.goalsTeam2}
                        color={match.goalsTeam2 > match.goalsTeam1 ? "success" : match.goalsTeam2 < match.goalsTeam1 ? "error" : "default"}
                        sx={{ fontWeight: "bold", fontSize: "1.2rem", height: 40, width: 50 }}
                      />
                    </Box>
                  </Box>

                  {/* Indicador de resultado */}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                    {match.goalsTeam1 > match.goalsTeam2 ? (
                      <Chip
                        icon={<EmojiEventsIcon />}
                        label="Victoria Equipo 1"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : match.goalsTeam2 > match.goalsTeam1 ? (
                      <Chip
                        icon={<EmojiEventsIcon />}
                        label="Victoria Equipo 2"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip label="Empate" color="warning" size="small" variant="outlined" />
                    )}
                  </Box>
                </Box>

                <Box sx={{ ml: 2 }}>
                  {openItems[index] ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </ListItemButton>

              <Collapse in={openItems[index]} timeout="auto" unmountOnExit>
                <Divider />
                <Box sx={{ bgcolor: "grey.50", p: 1 }}>
                  {/* VOD de Twitch */}
                  {match.twitchVodId && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                        📺 Revive el partido
                      </Typography>
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          paddingTop: "56.25%", // Aspect ratio 16:9
                          bgcolor: "black",
                          borderRadius: 2,
                          overflow: "hidden",
                          boxShadow: 2,
                        }}
                      >
                        <iframe
                          src={`https://player.twitch.tv/?video=${match.twitchVodId}&parent=${window.location.hostname}&autoplay=false`}
                          allowFullScreen
                          title="Twitch VOD Player"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: "none",
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Alineación táctica */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom>
                      ⚽ Alineaciones
                    </Typography>
                    <MatchLineup
                      team1Players={match.players1}
                      team2Players={match.players2}
                      allPlayers={players}
                      mvpPlayerId={match.mvpPlayerId}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Equipo 1 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      fontWeight="bold"
                      sx={{
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 16,
                          bgcolor: "primary.main",
                          borderRadius: 1
                        }}
                      />
                      Equipo 1
                    </Typography>
                    {match.players1.map((player, idx) => {
                      const playerName = getPlayerDisplay(players.find((p) => p.id === player.id)) || player.name;
                      const isGK = player.position === "POR" || player.isGK;
                      const isMVP = match.mvpPlayerId && player.id === match.mvpPlayerId;
                      return (
                        <Box
                          key={player.id || idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            py: 0.75,
                            px: 1,
                            mb: 0.5,
                            bgcolor: "white",
                            borderRadius: 1,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          }}
                        >
                          {/* Posición */}
                          {(player.position || player.isGK) && (
                            <Chip
                              label={player.position || "POR"}
                              size="small"
                              color={isGK ? "info" : "default"}
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: "bold",
                                minWidth: 38,
                                "& .MuiChip-label": { px: 0.5 }
                              }}
                            />
                          )}

                          {/* Nombre */}
                          <Typography
                            variant="body2"
                            fontWeight={isGK ? "bold" : "medium"}
                            sx={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.875rem"
                            }}
                          >
                            {playerName}
                          </Typography>

                          {/* Stats - solo para no porteros */}
                          {!isGK && (
                            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                              {player.goals > 0 && (
                                <Box sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.25,
                                  bgcolor: "success.50",
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5
                                }}>
                                  <SportsSoccer sx={{ fontSize: "1.1rem", color: "success.main" }} />
                                  <Typography variant="caption" fontWeight="bold" color="success.main" fontSize={'0.85rem'}>
                                    {player.goals}
                                  </Typography>
                                </Box>
                              )}
                              {player.assists > 0 && (
                                <Box sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.25,
                                  bgcolor: "info.50",
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5
                                }}>
                                  <img
                                    src={AssistIcon}
                                    style={{ width: 18, height: 18, }}
                                  />
                                  <Typography variant="caption" fontWeight="bold" color="info.main" fontSize={'0.85rem'}>
                                    {player.assists}
                                  </Typography>
                                </Box>
                              )}
                              {player.ownGoals > 0 && (
                                <Box sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.25,
                                  bgcolor: "error.50",
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5
                                }}>
                                  <SportsSoccer sx={{ fontSize: "1.1rem", color: "error.main" }} />
                                  <Typography variant="caption" fontWeight="bold" color="error.main" fontSize={'0.85rem'}>
                                    {player.ownGoals}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* MVP Indicator */}
                          {isMVP && (
                            <Chip
                              label="MVP"
                              size="small"
                              sx={{
                                height: 22,
                                bgcolor: "#FFD700",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "0.65rem",
                                "& .MuiChip-icon": {
                                  fontSize: "0.9rem",
                                  color: "#000"
                                },
                                "& .MuiChip-label": { px: 0.5 }
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Separador entre equipos */}
                  <Divider sx={{ my: 2 }} />

                  {/* Equipo 2 */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      fontWeight="bold"
                      sx={{
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5
                      }}
                    >
                      <Box
                        sx={{
                          width: 4,
                          height: 16,
                          bgcolor: "primary.main",
                          borderRadius: 1
                        }}
                      />
                      Equipo 2
                    </Typography>
                    {match.players2.map((player, idx) => {
                      const playerName = getPlayerDisplay(players.find((p) => p.id === player.id)) || player.name;
                      const isGK = player.position === "POR" || player.isGK;
                      const isMVP = match.mvpPlayerId && player.id === match.mvpPlayerId;
                      return (
                        <Box
                          key={player.id || idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            py: 0.75,
                            px: 1,
                            mb: 0.5,
                            bgcolor: "white",
                            borderRadius: 1,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                          }}
                        >
                          {/* Posición */}
                          {(player.position || player.isGK) && (
                            <Chip
                              label={player.position || "POR"}
                              size="small"
                              color={isGK ? "info" : "default"}
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: "bold",
                                minWidth: 38,
                                "& .MuiChip-label": { px: 0.5 }
                              }}
                            />
                          )}

                          {/* Nombre */}
                          <Typography
                            variant="body2"
                            fontWeight={isGK ? "bold" : "medium"}
                            sx={{
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "0.875rem"
                            }}
                          >
                            {playerName}
                          </Typography>

                          {/* Stats - solo para no porteros */}
                          {!isGK && (
                            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                              {player.goals > 0 && (
                                <Box sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.25,
                                  bgcolor: "success.50",
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5
                                }}>
                                  <SportsSoccer sx={{ fontSize: "1.1rem", color: "success.main" }} />
                                  <Typography variant="caption" fontWeight="bold" color="success.main" fontSize={'0.85rem'}>
                                    {player.goals}
                                  </Typography>
                                </Box>
                              )}
                              {player.assists > 0 && (
                                <Box sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.25,
                                  bgcolor: "info.50",
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5
                                }}>
                                  <img
                                    src={AssistIcon}
                                    style={{ width: 18, height: 18 }}
                                  />
                                  <Typography variant="caption" fontWeight="bold" color="info.main" fontSize={'0.85rem'}>
                                    {player.assists}
                                  </Typography>
                                </Box>
                              )}
                              {player.ownGoals > 0 && (
                                <Box sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.25,
                                  bgcolor: "error.50",
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5
                                }}>
                                  <SportsSoccer sx={{ fontSize: "1.1rem", color: "error.main" }} />
                                  <Typography variant="caption" fontWeight="bold" color="error.main" fontSize={'0.85rem'}>
                                    {player.ownGoals}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}

                          {/* MVP Indicator */}
                          {isMVP && (
                            <Chip
                              label="MVP"
                              size="small"
                              sx={{
                                height: 22,
                                bgcolor: "#FFD700",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "0.65rem",
                                "& .MuiChip-icon": {
                                  fontSize: "0.9rem",
                                  color: "#000"
                                },
                                "& .MuiChip-label": { px: 0.5 }
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Botón WhatsApp */}
                  <Divider sx={{ my: 2 }} />

                  {/* Botón MVP Vote */}
                  {(() => {
                    const voteStatus = canVote(match);
                    if (voteStatus.hasVoted) {
                      return (
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                          <Box
                            sx={{
                              bgcolor: "success.50",
                              border: "1px solid",
                              borderColor: "success.main",
                              borderRadius: 2,
                              px: 3,
                              py: 1.5,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "success.dark", textAlign: "center" }}
                            >
                              ✅ Ya votaste MVP: <strong>{voteStatus.votedFor}</strong>
                            </Typography>
                          </Box>
                        </Box>
                      );
                    }

                    if (voteStatus.canVote) {
                      return (
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                          <Button
                            onClick={(e) => handleOpenMVPVote(match, e)}
                            variant="contained"
                            color="warning"
                            startIcon={<EmojiEventsIcon />}
                            sx={{
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              fontWeight: 600,
                            }}
                          >
                            Votar MVP
                          </Button>
                        </Box>
                      );
                    }

                    return null;
                  })()}

                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Tooltip title="Compartir resumen en WhatsApp">
                      <IconButton
                        onClick={(e) => handleShareWhatsApp(match, e)}
                        sx={{
                          color: "#25D366",
                          bgcolor: "rgba(37, 211, 102, 0.08)",
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          "&:hover": {
                            bgcolor: "rgba(37, 211, 102, 0.15)",
                          },
                        }}
                      >
                        <WhatsAppIcon />
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, fontWeight: 600, color: "#25D366" }}
                        >
                          Compartir resumen
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Collapse>
            </Card>
          ))}
        </Box>
      </Box>

      {/* MVP Vote Modal */}
      <MVPVoteModal
        open={mvpModalOpen}
        onClose={handleCloseMVPVote}
        match={selectedMatch}
        allPlayers={players.filter(player=> player.userId!== user.uid)}
        onVote={handleVote}
      />
    </Grid2>
  );
};

export default HistoricMatchesList;
