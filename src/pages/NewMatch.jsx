import {
  Box,
  Button,
  Checkbox,
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
import { useNavigate, useParams } from "react-router";
import { Outlet } from "react-router";
import { getAllPlayers } from "../firebase/endpoints";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

const NewMatch = () => {
  const navigate = useNavigate();
  const { admin } = useParams();
  const [players, setPlayers] = useState([]);
  const [tabIndex, setTabIndex] = useState("1");
  const [newMatchForm, setNewMatchForm] = useState({
    date: dayjs(new Date()),
    players1: [],
    players2: [],
  });

  const handleSave = () => {
    console.log(newMatchForm);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleShouldBeDisabled = (playerId) => {
    const players1 = newMatchForm.players1.map((player) => player.id);
    const players2 = newMatchForm.players2.map((player) => player.id);

    return players1.includes(playerId) || players2.includes(playerId);
  };
  useEffect(() => {
    getAllPlayers().then((res) => setPlayers(res));
  }, []);

  useEffect(() => {
    console.log(players);
  }, [players]);

  return (
    <>
      <Grid2 container flexGrow={1} direction="column">
        <Grid2
          container
          flexGrow={1}
          alignItems="center"
          justifyContent="center"
          marginTop={2}
          direction="column"
        >
          <Box
            sx={{
              width: "100%",
              typography: "body1",
              marginTop: 2,
            }}
          >
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
              <TabPanel
                value="1"
                sx={{ padding: 0, paddingRight: 1, marginTop: 1 }}
              >
                <Grid2
                  container
                  sx={{
                    width: "100%",
                    margin: 0,
                    padding: 0,
                  }}
                  direction="column"
                  spacing={2}
                >
                  <Typography sx={{ paddingLeft: 1 }}>P?</Typography>
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
                        <Checkbox
                          size="small"
                          sx={{
                            marginRight: 0,
                            paddingRight: 0.5,
                            paddingLeft: 0.5,
                          }}
                          value={newMatchForm?.players1[value]?.isGK ?? false}
                          onChange={({ target }) => {
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players1];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                isGK: target.value,
                              };
                              return {
                                ...prev,
                                players1: updatedPlayers,
                              };
                            });
                          }}
                        />
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
                            {players.map((player) => {
                              const disable = handleShouldBeDisabled(player.id);
                              return (
                                <MenuItem
                                  disabled={disable}
                                  key={player.id}
                                  value={player.id}
                                >
                                  {player.name}
                                </MenuItem>
                              );
                            })}
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
              <TabPanel
                value="2"
                sx={{ padding: 0, paddingRight: 1, marginTop: 1 }}
              >
                <Grid2
                  container
                  sx={{
                    width: "100%",
                    margin: 0,
                    padding: 0,
                  }}
                  direction="column"
                  spacing={2}
                >
                  <Typography sx={{ paddingLeft: 1 }}>P?</Typography>
                  {[0, 1, 2, 3, 4, 5, 6].map((value) => {
                    return (
                      <Grid2
                        key={value}
                        container
                        direction="row"
                        sx={{ width: "100%" }}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Checkbox
                          size="small"
                          sx={{
                            marginRight: 0,
                            paddingRight: 0.5,
                            paddingLeft: 0.5,
                          }}
                          value={newMatchForm?.players2[value]?.isGK ?? false}
                          onChange={({ target }) => {
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players2];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                isGK: target.value,
                              };
                              return {
                                ...prev,
                                players2: updatedPlayers,
                              };
                            });
                          }}
                        />
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

          <Grid2
            marginTop={2}
            marginBottom={5}
            direction="row"
            alignItems="center"
            flexGrow={1}
            spacing={2}
            container
          >
            <DatePicker
              label="Fecha"
              value={newMatchForm.date}
              onChange={(value) =>
                setNewMatchForm((prev) => ({ ...prev, date: value }))
              }
            />
            <Button
              disabled={admin === "false"}
              variant="contained"
              onClick={handleSave}
            >
              Guardar
            </Button>
          </Grid2>
        </Grid2>
      </Grid2>
      <Outlet />
    </>
  );
};

export default NewMatch;
