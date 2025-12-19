import { ExpandLess, ExpandMore, SportsSoccer } from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Box,
  Collapse,
  Grid2,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
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
      sx={{ height: "100%", overflow: "hidden" }}
    >
      <Box
        sx={{
          paddingY: 2,
          marginRight: 7,
        }}
      >
        <Typography variant="body2" textAlign={"center"}>Total: {matches.length}</Typography>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            padding: 0,
            margin: 0,
          }}
        >
          {matches.map((match, index) => (
            <div key={index}>
              <ListItemButton
                onClick={() => handleClick(index)}
                sx={{
                  bgcolor: index % 2 === 0 ? "grey.100" : "grey.50",
                }}
              >
                <ListItemText
                  primary={
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong>Equipo 1</strong>
                      <span
                      >{`${match.goalsTeam1} - ${match.goalsTeam2}`}</span>
                      <strong>Equipo 2</strong>
                    </span>
                  }
                  secondary={match.date.toDate().toISOString().split("T")[0]}
                />
                <Box sx={{ marginLeft: 2 }}>
                  {openItems[index] ? <ExpandLess /> : <ExpandMore />}
                </Box>
              </ListItemButton>
              <Collapse in={openItems[index]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {match.players1.map((player1, index) => {
                    const player2 = match.players2[index];
                    return (
                      <Box
                        key={player1.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 16px",
                          bgcolor: index % 2 === 0 ? "grey.100" : "grey.50",
                        }}
                      >
                        <ListItemText
                          primary={
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <span style={{ marginLeft: 8 }}>
                                {(player1.isGK ? "GK " : "") + player1.name}
                              </span>
                              {player1.isGK ? (
                                <></>
                              ) : (
                                <>
                                  {player1.goals > 0 ? (
                                    <>
                                      <SportsSoccer style={{ marginLeft: 4 }} />
                                      x{player1.goals}
                                    </>
                                  ) : null}
                                  {player1.assists > 0 ? (
                                    <>
                                      <img
                                        src={AssistIcon}
                                        style={{ marginLeft: 4 }}
                                      />
                                      x{player1.assists}
                                    </>
                                  ) : null}
                                </>
                              )}
                            </span>
                          }
                          sx={{ flex: 1 }}
                        />
                        <ListItemText
                          primary={
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              {player2.goals > 0 ? (
                                <>
                                  <SportsSoccer style={{ marginLeft: 4 }} />x
                                  {player2.goals}
                                </>
                              ) : null}
                              {player2.assists > 0 ? (
                                <>
                                  <img
                                    src={AssistIcon}
                                    style={{ marginLeft: 4 }}
                                  />
                                  x{player2.assists}
                                </>
                              ) : null}
                              <span style={{ marginLeft: 8 }}>
                                {(player2.isGK ? "GK " : "") + player2.name}
                              </span>
                            </span>
                          }
                          sx={{ flex: 1, textAlign: "right" }}
                        />
                      </Box>
                    );
                  })}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "12px 16px",
                      bgcolor: "grey.200",
                      borderTop: "1px solid",
                      borderColor: "grey.300",
                    }}
                  >
                    <Tooltip title="Compartir en WhatsApp">
                      <IconButton
                        onClick={(e) => handleShareWhatsApp(match, e)}
                        disableRipple
                        sx={{
                          color: "#25D366",
                          borderRadius: 1,
                          "&:hover": {
                            backgroundColor: "rgba(37, 211, 102, 0.08)",
                          },
                        }}
                      >
                        <WhatsAppIcon />
                        <Typography
                          variant="body2"
                          sx={{ marginLeft: 1, fontWeight: 500 }}
                        >
                          Compartir resumen
                        </Typography>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </List>
              </Collapse>
            </div>
          ))}
        </List>
      </Box>
    </Grid2>
  );
};

export default HistoricMatchesList;
