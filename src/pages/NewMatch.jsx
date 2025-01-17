import {
  Box,
  Button,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Outlet } from "react-router";
import { getAllPlayers } from "../firebase/endpoints";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

const NewMatch = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [tabIndex, setTabIndex] = useState("1");
  const [newMatchForm, setNewMatchForm] = useState({
    date: dayjs(new Date()),
    players1: [],
    players2: [],
  });

  useEffect(() => {
    getAllPlayers().then((res) => setPlayers(res));
  }, []);

  useEffect(() => {
    console.log(players);
  }, [players]);

  const handleSave = () => {
    console.log(newMatchForm);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <>
      <Grid2 container flexGrow={1} direction="column">
        <Grid2
          container
          alignItems="center"
          justifyContent="space-around"
          flexGrow={1}
          marginTop={2}
        >
          <Button onClick={() => navigate("/assistants")}>Asistencias</Button>
          <Typography>Registrar Partido</Typography>
          <Button onClick={() => navigate("/scorers")}>Goleadores</Button>
        </Grid2>
        <Grid2
          container
          flexGrow={1}
          alignItems="center"
          justifyContent="center"
          marginTop={2}
          direction="column"
        >
          <DatePicker
            label="Fecha"
            value={newMatchForm.date}
            onChange={(value) =>
              setNewMatchForm((prev) => ({ ...prev, date: value }))
            }
          />
          <Box sx={{ width: "100%", typography: "body1", marginTop: 2 }}>
            <TabContext value={tabIndex}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleTabChange}
                  aria-label="lab API tabs example"
                  variant="fullWidth"
                >
                  <Tab label="Equipo 1" value="1" />
                  <Tab label="Equipo 2" value="2" />
                </TabList>
              </Box>
              <TabPanel value="1">
                <Grid2
                  container
                  sx={{ width: "100%" }}
                  direction="column"
                  spacing={2}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((value) => {
                    return (
                      <Grid2
                        key={value}
                        container
                        direction="row"
                        // flexGrow={1}
                        sx={{ width: "100%" }}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FormControl sx={{ flexGrow: 1 }}>
                          <InputLabel id={`player${value}`}>{`Jugador #${
                            value + 1
                          }`}</InputLabel>
                          <Select
                            labelId={`player${value}`}
                            value={newMatchForm?.players1[value]?.id ?? ""}
                            label={`Jugador #${value + 1}`}
                            sx={{ minWidth: "50%" }}
                            onChange={({ target }) =>
                              setNewMatchForm((prev) => {
                                const updatedPlayers = [...prev.players1];
                                updatedPlayers[value] = {
                                  id: target.value,
                                  goals: 0,
                                  assists: 0,
                                };
                                return {
                                  ...prev,
                                  players1: updatedPlayers,
                                };
                              })
                            }
                          >
                            {players.map((player) => (
                              <MenuItem key={player.id} value={player.id}>
                                {player.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Goles"
                          type="number"
                          sx={{ width: "20%" }}
                          value={newMatchForm?.players1[value]?.goals ?? 0}
                          onChange={({ target }) =>
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players1];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                goals: target.value,
                              };
                              return {
                                ...prev,
                                players1: updatedPlayers,
                              };
                            })
                          }
                        />
                        <TextField
                          label="Asistencias"
                          type="number"
                          sx={{ width: "20%" }}
                          value={newMatchForm?.players1[value]?.assists ?? 0}
                          onChange={({ target }) =>
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players1];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                assists: target.value,
                              };
                              return {
                                ...prev,
                                players1: updatedPlayers,
                              };
                            })
                          }
                        />
                      </Grid2>
                    );
                  })}
                </Grid2>
              </TabPanel>
              <TabPanel value="2">
                <Grid2
                  container
                  sx={{ width: "100%" }}
                  direction="column"
                  spacing={2}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((value) => {
                    return (
                      <Grid2
                        key={value}
                        container
                        direction="row"
                        // flexGrow={1}
                        sx={{ width: "100%" }}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <FormControl sx={{ flexGrow: 1 }}>
                          <InputLabel id={`player${value}`}>{`Jugador #${
                            value + 1
                          }`}</InputLabel>
                          <Select
                            value={newMatchForm?.players2[value]?.id ?? ""}
                            label={`Jugador #${value + 1}`}
                            labelId={`player${value}`}
                            sx={{ minWidth: "50%" }}
                            onChange={({ target }) =>
                              setNewMatchForm((prev) => {
                                const updatedPlayers = [...prev.players2];
                                updatedPlayers[value] = {
                                  id: target.value,
                                  goals: 0,
                                  assists: 0,
                                };
                                return {
                                  ...prev,
                                  players2: updatedPlayers,
                                };
                              })
                            }
                          >
                            {players.map((player) => (
                              <MenuItem key={player.id} value={player.id}>
                                {player.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Goles"
                          type="number"
                          sx={{ width: "20%" }}
                          value={newMatchForm?.players2[value]?.goals ?? 0}
                          onChange={({ target }) =>
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players2];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                goals: target.value,
                              };
                              return {
                                ...prev,
                                players2: updatedPlayers,
                              };
                            })
                          }
                        />
                        <TextField
                          label="Asistencias"
                          type="number"
                          sx={{ width: "20%" }}
                          value={newMatchForm?.players2[value]?.assists ?? 0}
                          onChange={({ target }) =>
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players2];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                assists: target.value,
                              };
                              return {
                                ...prev,
                                players2: updatedPlayers,
                              };
                            })
                          }
                        />
                      </Grid2>
                    );
                  })}
                </Grid2>
              </TabPanel>
            </TabContext>
          </Box>

          <Box marginTop={2} marginBottom={5}>
            <Button variant="contained" onClick={handleSave}>
              Guardar
            </Button>
          </Box>
        </Grid2>
      </Grid2>
      <Outlet />
    </>
  );
};

export default NewMatch;
