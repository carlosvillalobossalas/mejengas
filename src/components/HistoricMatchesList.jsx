import { ExpandLess, ExpandMore, SportsSoccer } from "@mui/icons-material";
import {
  Box,
  Collapse,
  Grid2,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useState } from "react";
import AssistIcon from "/assets/shoe.png";

const HistoricMatchesList = ({ matches = [] }) => {
  const [openItems, setOpenItems] = useState({});

  const handleClick = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  return (
    <Grid2
      container
      flexDirection="column"
      sx={{ height: "100%", overflow: "hidden" }}
    >
      <Box
        sx={{
          paddingY: 1,
        }}
      >
        <Typography variant="h6" textAlign={"center"} fontWeight={"bold"}>
          Mejengas
        </Typography>
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
                        style={{ margin: "0 10px" }}
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
