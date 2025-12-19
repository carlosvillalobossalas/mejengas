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
} from "@mui/material";
import { useState } from "react";
import AssistIcon from "/assets/shoe.png";
import { formatMatchSummary, shareToWhatsApp } from "../utils/whatsappShare";

const HistoricMatchesList = ({ matches = [] }) => {
  const [openItems, setOpenItems] = useState({});

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

  return (
    <Grid2
      container
      flexDirection="column"
      sx={{ height: "100%", overflow: "hidden", bgcolor: "grey.50" }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 2,
          px: 2,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6" textAlign="center" fontWeight="bold">
          ⚽ Histórico de Partidos
        </Typography>
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
                <Box sx={{ bgcolor: "grey.50", p: 2 }}>
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

                  {/* Título de secciones */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">
                      Equipo 1
                    </Typography>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">
                      Equipo 2
                    </Typography>
                  </Box>

                  {/* Jugadores */}
                  {match.players1.map((player1, playerIndex) => {
                    const player2 = match.players2[playerIndex];
                    return (
                      <Box
                        key={player1.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1.5,
                          px: 2,
                          mb: 1,
                          bgcolor: "white",
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      >
                        {/* Equipo 1 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 1,
                          }}
                        >
                          {player1.isGK && (
                            <Chip
                              label="GK"
                              size="small"
                              color="info"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                          <Typography variant="body2" fontWeight={player1.isGK ? "bold" : "normal"}>
                            {player1.name}
                          </Typography>
                          {!player1.isGK && (
                            <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                              {player1.goals > 0 && (
                                <Chip
                                  icon={<SportsSoccer sx={{ fontSize: "0.9rem !important" }} />}
                                  label={player1.goals}
                                  size="small"
                                  color="success"
                                  sx={{ height: 22 }}
                                />
                              )}
                              {player1.assists > 0 && (
                                <Chip
                                  icon={
                                    <img
                                      src={AssistIcon}
                                      style={{ width: 12, height: 12, marginLeft: 4 }}
                                    />
                                  }
                                  label={player1.assists}
                                  size="small"
                                  color="info"
                                  sx={{ height: 22 }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>

                        {/* Separador */}
                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                        {/* Equipo 2 */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 1,
                            flex: 1,
                          }}
                        >
                          {!player2.isGK && (
                            <Box sx={{ display: "flex", gap: 0.5, mr: 1 }}>
                              {player2.goals > 0 && (
                                <Chip
                                  icon={<SportsSoccer sx={{ fontSize: "0.9rem !important" }} />}
                                  label={player2.goals}
                                  size="small"
                                  color="success"
                                  sx={{ height: 22 }}
                                />
                              )}
                              {player2.assists > 0 && (
                                <Chip
                                  icon={
                                    <img
                                      src={AssistIcon}
                                      style={{ width: 12, height: 12, marginLeft: 4 }}
                                    />
                                  }
                                  label={player2.assists}
                                  size="small"
                                  color="info"
                                  sx={{ height: 22 }}
                                />
                              )}
                            </Box>
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={player2.isGK ? "bold" : "normal"}
                            textAlign="right"
                          >
                            {player2.name}
                          </Typography>
                          {player2.isGK && (
                            <Chip
                              label="GK"
                              size="small"
                              color="info"
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      </Box>
                    );
                  })}

                  {/* Botón WhatsApp */}
                  <Divider sx={{ my: 2 }} />
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
    </Grid2>
  );
};

export default HistoricMatchesList;
