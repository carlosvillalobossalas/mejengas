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
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "success.main",
          color: "white",
          p: 2,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
          ⚽ Registrar Partido
        </Typography>
      </Box>

      {/* Tabs */}
      <TabContext value={tabIndex}>
        <Box sx={{ bgcolor: "white", borderBottom: 1, borderColor: "divider", flexShrink: 0 }}>
          <TabList
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontSize: { xs: "0.875rem", sm: "1rem" },
                fontWeight: 600,
                py: 1.5,
              },
            }}
          >
            <Tab label="Equipo 1 🔵" value="1" />
            <Tab label="Equipo 2 🔴" value="2" />
          </TabList>
        </Box>

        {/* Team 1 Panel */}
        <TabPanel value="1" sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflow: "auto", minHeight: 0 }}>
          <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ width: 30, textAlign: "center", fontWeight: "bold" }}>P?</Box>
              <Box component="span" sx={{ flex: 1 }}>Jugador</Box>
              <Box component="span" sx={{ width: 60, textAlign: "center" }}>Goles</Box>
              <Box component="span" sx={{ width: 60, textAlign: "center" }}>Asist.</Box>
            </Typography>

            {[0, 1, 2, 3, 4, 5, 6].map((value, index) => (
              <Box
                key={value}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  bgcolor: "white",
                  p: 1,
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Checkbox
                  size="small"
                  disabled={!newMatchForm?.players1[value]?.id}
                  checked={newMatchForm?.players1[value]?.isGK ?? false}
                  onChange={({ target }) => {
                    setNewMatchForm((prev) => {
                      const updatedPlayers = [...prev.players1];
                      updatedPlayers[value] = {
                        ...updatedPlayers[value],
                        isGK: target.checked,
                      };
                      return { ...prev, players1: updatedPlayers };
                    });
                  }}
                  sx={{ p: 0.5 }}
                />

                <FormControl sx={{ flex: 1, minWidth: 120 }} size="small">
                  <InputLabel>{`J${value + 1}`}</InputLabel>
                  <Select
                    value={newMatchForm?.players1[value]?.id ?? ""}
                    label={`J${value + 1}`}
                    disabled={newMatchForm.players1.length < index}
                    onChange={({ target }) =>
                      setNewMatchForm((prev) => {
                        const updatedPlayers = [...prev.players1];
                        updatedPlayers[value] = {
                          id: target.value,
                          goals: 0,
                          assists: 0,
                          isGK: false,
                        };
                        return { ...prev, players1: updatedPlayers };
                      })
                    }
                  >
                    {players.map((player) => (
                      <MenuItem
                        disabled={handleShouldBeDisabled(player.id)}
                        key={player.id}
                        value={player.id}
                      >
                        {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 60 }}
                  disabled={!newMatchForm?.players1[value]?.id}
                  value={newMatchForm?.players1[value]?.goals ?? 0}
                  onChange={({ target }) =>
                    setNewMatchForm((prev) => {
                      const updatedPlayers = [...prev.players1];
                      updatedPlayers[value] = {
                        ...updatedPlayers[value],
                        goals: parseInt(target.value) || 0,
                      };
                      return { ...prev, players1: updatedPlayers };
                    })
                  }
                  InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
                />

                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 60 }}
                  disabled={!newMatchForm?.players1[value]?.id}
                  value={newMatchForm?.players1[value]?.assists ?? 0}
                  onChange={({ target }) =>
                    setNewMatchForm((prev) => {
                      const updatedPlayers = [...prev.players1];
                      updatedPlayers[value] = {
                        ...updatedPlayers[value],
                        assists: parseInt(target.value) || 0,
                      };
                      return { ...prev, players1: updatedPlayers };
                    })
                  }
                  InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
                />
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Team 2 Panel */}
        <TabPanel value="2" sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflow: "auto", minHeight: 0 }}>
          <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ width: 30, textAlign: "center", fontWeight: "bold" }}>P?</Box>
              <Box component="span" sx={{ flex: 1 }}>Jugador</Box>
              <Box component="span" sx={{ width: 60, textAlign: "center" }}>Goles</Box>
              <Box component="span" sx={{ width: 60, textAlign: "center" }}>Asist.</Box>
            </Typography>

            {[0, 1, 2, 3, 4, 5, 6].map((value, index) => (
              <Box
                key={value}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                  bgcolor: "white",
                  p: 1,
                  borderRadius: 2,
                  boxShadow: 1,
                }}
              >
                <Checkbox
                  size="small"
                  disabled={!newMatchForm?.players2[value]?.id}
                  checked={newMatchForm?.players2[value]?.isGK ?? false}
                  onChange={({ target }) => {
                    setNewMatchForm((prev) => {
                      const updatedPlayers = [...prev.players2];
                      updatedPlayers[value] = {
                        ...updatedPlayers[value],
                        isGK: target.checked,
                      };
                      return { ...prev, players2: updatedPlayers };
                    });
                  }}
                  sx={{ p: 0.5 }}
                />

                <FormControl sx={{ flex: 1, minWidth: 120 }} size="small">
                  <InputLabel>{`J${value + 1}`}</InputLabel>
                  <Select
                    value={newMatchForm?.players2[value]?.id ?? ""}
                    label={`J${value + 1}`}
                    disabled={newMatchForm.players2.length < index}
                    onChange={({ target }) =>
                      setNewMatchForm((prev) => {
                        const updatedPlayers = [...prev.players2];
                        updatedPlayers[value] = {
                          id: target.value,
                          goals: 0,
                          assists: 0,
                          isGK: false,
                        };
                        return { ...prev, players2: updatedPlayers };
                      })
                    }
                  >
                    {players.map((player) => (
                      <MenuItem
                        disabled={handleShouldBeDisabled(player.id)}
                        key={player.id}
                        value={player.id}
                      >
                        {player.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 60 }}
                  disabled={!newMatchForm?.players2[value]?.id}
                  value={newMatchForm?.players2[value]?.goals ?? 0}
                  onChange={({ target }) =>
                    setNewMatchForm((prev) => {
                      const updatedPlayers = [...prev.players2];
                      updatedPlayers[value] = {
                        ...updatedPlayers[value],
                        goals: parseInt(target.value) || 0,
                      };
                      return { ...prev, players2: updatedPlayers };
                    })
                  }
                  InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
                />

                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 60 }}
                  disabled={!newMatchForm?.players2[value]?.id}
                  value={newMatchForm?.players2[value]?.assists ?? 0}
                  onChange={({ target }) =>
                    setNewMatchForm((prev) => {
                      const updatedPlayers = [...prev.players2];
                      updatedPlayers[value] = {
                        ...updatedPlayers[value],
                        assists: parseInt(target.value) || 0,
                      };
                      return { ...prev, players2: updatedPlayers };
                    })
                  }
                  InputProps={{ inputProps: { min: 0, style: { textAlign: "center" } } }}
                />
              </Box>
            ))}
          </Box>
        </TabPanel>
      </TabContext>

      {/* Footer compacto y responsivo */}
      <Box
        sx={{
          bgcolor: "white",
          borderTop: 1,
          borderColor: "divider",
          p: { xs: 1, sm: 2 },
          boxShadow: 3,
          flexShrink: 0,
          height: {xs: 220, sm: 120}
        }}
      >
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: { xs: 1, md: 2 },
            width: "100%",
          }}
        >
          {/* Marcador */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: { xs: "none", md: 1 },
              minWidth: 0,
              gap: 1,
              mb: { xs: 1, md: 0 },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
                Equipo 1
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary" sx={{ fontSize: { xs: "1.1rem", sm: "2rem" }, lineHeight: 1.1 }}>
                {newMatchForm.players1.reduce((acc, value) => {
                  if (value.goals === "") return acc;
                  return parseInt(acc ?? 0) + (parseInt(value?.goals) ?? 0);
                }, 0) ?? 0}
              </Typography>
            </Box>
            <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: "1.1rem", sm: "1.5rem" }, mx: 1 }}>
              -
            </Typography>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
                Equipo 2
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error" sx={{ fontSize: { xs: "1.1rem", sm: "2rem" }, lineHeight: 1.1 }}>
                {newMatchForm.players2.reduce((acc, value) => {
                  if (value.goals === "") return acc;
                  return parseInt(acc ?? 0) + parseInt(value?.goals ?? 0);
                }, 0) ?? 0}
              </Typography>
            </Box>
          </Box>
          {/* Fecha y botón */}
          <Box
            sx={{
              display: "flex",
              flex: 2,
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              alignItems: "center",
              minWidth: 0,
            }}
          >
            <DatePicker
              label="Fecha del partido"
              value={newMatchForm.date}
              onChange={(value) =>
                setNewMatchForm((prev) => ({ ...prev, date: value }))
              }
              sx={{ flex: 1, minWidth: 0 }}
              slotProps={{
                textField: {
                  size: "small",
                },
              }}
            />
            <Button
              disabled={isSaving}
              variant="contained"
              size="medium"
              onClick={handleSave}
              sx={{
                px: 2,
                py: 1,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                fontWeight: 600,
                textTransform: "none",
                minWidth: { xs: "100%", sm: 120 },
                width: { xs: "100%", sm: "auto" },
                mt: { xs: 1, sm: 0 },
              }}
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </Box>
        </Box>
      </Box>
      <Outlet />
    </Box>
  );
};

export default NewMatch;
