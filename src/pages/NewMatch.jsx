import {
  Box,
  Button,
  Checkbox,
  Divider,
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
import { useParams } from "react-router";
import { Outlet } from "react-router";
import { getAllPlayers, saveNewMatch } from "../firebase/endpoints";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { toast } from "react-toastify";

const initialState = {
  date: dayjs(new Date()),
  players1: [],
  players2: [],
  goalsTeam1: 0,
  goalsTeam2: 0,
};

const NewMatch = ({ players = [] }) => {
  const { admin } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [tabIndex, setTabIndex] = useState("1");
  const [newMatchForm, setNewMatchForm] = useState(initialState);

  const handleSave = async () => {
    //check double gks
    if (newMatchForm.players1.filter((p) => p.isGK).length > 1) {
      toast.error("Equipo 1 tiene mas de un portero");
      return;
    } else if (newMatchForm.players2.filter((p) => p.isGK).length > 1) {
      toast.error("Equipo 2 tiene mas de un portero");
      return;
    } else if (newMatchForm.players1.length !== 7) {
      toast.error("A Equipo 1 le faltan jugadores");
      return;
    } else if (newMatchForm.players2.length !== 7) {
      toast.error("A Equipo 2 le faltan jugadores");
      return;
    }
    setIsSaving(true);
    const newMatchData = {
      ...newMatchForm,
      players1: newMatchForm.players1.map((player) => ({
        ...player,
        name: players.find((p) => p.id === player.id).name,
      })),
      players2: newMatchForm.players2.map((player) => ({
        ...player,
        name: players.find((p) => p.id === player.id).name,
      })),
    };
    await saveNewMatch(newMatchData, players);
    setIsSaving(false);
    setNewMatchForm(initialState);
    toast.success("Partido registrado");
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleShouldBeDisabled = (playerId) => {
    const players1 = newMatchForm?.players1.map((player) => player.id);
    const players2 = newMatchForm?.players2.map((player) => player.id);

    return players1.includes(playerId) || players2.includes(playerId);
  };

  useEffect(() => {
    console.log(players);
  }, [players]);

  useEffect(() => {
    console.log(newMatchForm);
  }, [newMatchForm]);

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
                          disabled={
                            newMatchForm?.players1[value]?.isGK === undefined
                          }
                          checked={newMatchForm?.players1[value]?.isGK ?? false}
                          onChange={({ target }) => {
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players1];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                isGK: target.checked,
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
                            sx={{ width: "100%", maxWidth: 150 }}
                            onChange={({ target }) =>
                              setNewMatchForm((prev) => {
                                const updatedPlayers = [...prev.players1];
                                updatedPlayers[value] = {
                                  id: target.value,
                                  goals: 0,
                                  assists: 0,
                                  isGK: false,
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
                          disabled={!newMatchForm?.players1[value]?.id}
                          value={newMatchForm?.players1[value]?.goals ?? 0}
                          onChange={({ target }) =>
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players1];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                goals: parseInt(target.value),
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
                          disabled={!newMatchForm?.players1[value]?.id}
                          value={newMatchForm?.players1[value]?.assists ?? 0}
                          onChange={({ target }) =>
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players1];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                assists: parseInt(target.value),
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
                          disabled={
                            newMatchForm?.players2[value]?.isGK === undefined
                          }
                          checked={newMatchForm?.players2[value]?.isGK ?? false}
                          onChange={({ target }) => {
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players2];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                isGK: target.checked,
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
                            sx={{ width: "100%", maxWidth: 150 }}
                            onChange={({ target }) =>
                              setNewMatchForm((prev) => {
                                const updatedPlayers = [...prev.players2];
                                updatedPlayers[value] = {
                                  id: target.value,
                                  goals: 0,
                                  assists: 0,
                                  isGK: false,
                                };
                                return {
                                  ...prev,
                                  players2: updatedPlayers,
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
                          disabled={!newMatchForm?.players2[value]?.id}
                          sx={{ width: "20%" }}
                          value={newMatchForm?.players2[value]?.goals ?? 0}
                          onChange={({ target }) =>
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players2];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                goals: parseInt(target.value),
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
                          disabled={!newMatchForm?.players2[value]?.id}
                          sx={{ width: "20%" }}
                          value={newMatchForm?.players2[value]?.assists ?? 0}
                          onChange={({ target }) =>
                            setNewMatchForm((prev) => {
                              const updatedPlayers = [...prev.players2];
                              updatedPlayers[value] = {
                                ...updatedPlayers[value],
                                assists: parseInt(target.value),
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
            <Divider sx={{ marginTop: 1 }} />
          </Box>
          <Grid2
            container
            direction="row"
            alignItems="center"
            justifyContent="space-around"
            marginTop={2}
          >
            <Typography>Marcador</Typography>
            <TextField
              sx={{ width: "35%" }}
              disabled={true}
              label="Equipo 1"
              value={
                newMatchForm.players1.reduce(
                  (acc, value) => {
                    if (value.goals === "") return acc;
                    return parseInt(acc ?? 0) + (parseInt(value?.goals) ?? 0);
                  },

                  0
                ) ?? 0
              }
              onChange={() => {}}
            />
            <TextField
              sx={{ width: "35%" }}
              disabled={true}
              label="Equipo 2"
              value={
                newMatchForm.players2.reduce((acc, value) => {
                  if (value.goals === "") return acc;

                  return parseInt(acc ?? 0) + parseInt(value?.goals ?? 0);
                }, 0) ?? 0
              }
              onChange={() => {}}
            />
          </Grid2>
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
              disabled={admin === "false" || isSaving}
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
