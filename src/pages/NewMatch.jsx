import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { getAllPlayers, saveNewMatch } from "../firebase/endpoints";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { toast } from "react-toastify";
import { getPlayerDisplay } from "../utils/playersDisplayName";

const emptyPlayers = Array(7).fill({ id: '', goals: 0, assists: 0, isGK: false });
const initialState = {
  date: dayjs(new Date()),
  players1: emptyPlayers.map((p) => ({ ...p })),
  players2: emptyPlayers.map((p) => ({ ...p })),
  goalsTeam1: 0,
  goalsTeam2: 0,
};

// ...existing code...

function NewMatch(props) {
  // Estado y hooks principales
  const [players, setPlayers] = useState([]);
  const [newMatchForm, setNewMatchForm] = useState(initialState);
  const [tabIndex, setTabIndex] = useState("1");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getAllPlayers(setPlayers)
  }, []);

  // Cambiar de tab
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // Deshabilitar jugadores ya seleccionados en ambos equipos
  const handleShouldBeDisabled = (playerId) => {
    return (
      newMatchForm.players1.some((p) => p?.id === playerId) ||
      newMatchForm.players2.some((p) => p?.id === playerId)
    );
  };

  // Guardar partido
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validaciones básicas
      const team1Valid = newMatchForm.players1.filter((p) => p?.id).length >= 1;
      const team2Valid = newMatchForm.players2.filter((p) => p?.id).length >= 1;
      if (!team1Valid || !team2Valid) {
        toast.error("Ambos equipos deben tener al menos un jugador.");
        setIsSaving(false);
        return;
      }
      await saveNewMatch({
        ...newMatchForm,
        date: newMatchForm.date ? newMatchForm.date.toISOString() : null,
      });
      toast.success("Partido guardado correctamente");
      setNewMatchForm({
        ...initialState,
        players1: emptyPlayers.map((p) => ({ ...p })),
        players2: emptyPlayers.map((p) => ({ ...p })),
      });
      setTabIndex("1");
    } catch (e) {
      toast.error("Error al guardar el partido");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.50",
        overflow: "auto",
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
            <Tab label="Resumen y Guardar" value="3" />
          </TabList>
        </Box>

        {/* Team 1 Panel */}
        <TabPanel value="1" sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflow: "auto", minHeight: 0 }}>
          {/* ...equipo 1 code... */}
          <Box sx={{ maxWidth: 600, mx: "auto", pb: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ width: 30, textAlign: "center", fontWeight: "bold" }}>P?</Box>
              <Box component="span" sx={{ flex: 1 }}>Jugador</Box>
              <Box component="span" sx={{ width: 60, textAlign: "center" }}>Goles</Box>
              <Box component="span" sx={{ width: 60, textAlign: "center" }}>Asist.</Box>
            </Typography>
            {(Array.isArray(newMatchForm.players1) ? newMatchForm.players1 : emptyPlayers).map((player, value) => (
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
                  disabled={!player?.id}
                  checked={player?.isGK ?? false}
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
                    value={player?.id ?? ""}
                    label={`J${value + 1}`}
                    disabled={newMatchForm.players1.length < value}
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
                    {players?.map((player) => (
                      <MenuItem
                        disabled={handleShouldBeDisabled(player.id)}
                        key={player.id}
                        value={player.id}
                      >
                        {getPlayerDisplay(player)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 60 }}
                  disabled={!player?.id}
                  value={player?.goals ?? 0}
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
                  slotProps={{ input: { min: 0, style: { textAlign: "center" } } }}
                />
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 60 }}
                  disabled={!player?.id}
                  value={player?.assists ?? 0}
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
                  slotProps={{ input: { min: 0, style: { textAlign: "center" } } }}
                />
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Team 2 Panel */}
        <TabPanel value="2" sx={{ p: { xs: 2, sm: 3 }, flex: 1, overflow: "auto", minHeight: 0 }}>
          {/* ...equipo 2 code... */}
          <Box sx={{ maxWidth: 600, mx: "auto", pb: 4 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="span" sx={{ width: 30, textAlign: "center", fontWeight: "bold" }}>P?</Box>
              <Box component="span" sx={{ flex: 1 }}>Jugador</Box>
              <Box component="span" sx={{ width: 60, textAlign: "center" }}>Goles</Box>
              <Box component="span" sx={{ width: 60, textAlign: "center" }}>Asist.</Box>
            </Typography>
            {(Array.isArray(newMatchForm.players2) ? newMatchForm.players2 : emptyPlayers).map((player, value) => (
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
                  disabled={!player?.id}
                  checked={player?.isGK ?? false}
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
                    value={player?.id ?? ""}
                    label={`J${value + 1}`}
                    disabled={newMatchForm.players2.length < value}
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
                    {players?.map((player) => (
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
                  disabled={!player?.id}
                  value={player?.goals ?? 0}
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
                  slotProps={{ input: { min: 0, style: { textAlign: "center" } } }}
                />
                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 60 }}
                  disabled={!player?.id}
                  value={player?.assists ?? 0}
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
                  slotProps={{ input: { min: 0, style: { textAlign: "center" } } }}
                />
              </Box>
            ))}
          </Box>
        </TabPanel>

        {/* Resumen y Guardar Panel */}
        <TabPanel value="3" sx={{ p: { xs: 2, sm: 3 }, flex: 1, minHeight: 0, overflow: "auto" }}>
          <Box sx={{ maxWidth: 600, mx: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {/* Marcador */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  Equipo 1
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="primary" sx={{ fontSize: { xs: "2rem", sm: "3rem" }, lineHeight: 1.1 }}>
                  {(Array.isArray(newMatchForm.players1)
                    ? newMatchForm.players1
                    : emptyPlayers
                  ).reduce((acc, value) => {
                    if (value.goals === "") return acc;
                    return parseInt(acc ?? 0) + (parseInt(value?.goals) ?? 0);
                  }, 0) ?? 0}
                </Typography>
              </Box>
              <Typography variant="h4" color="text.secondary" sx={{ fontSize: { xs: "1.5rem", sm: "2.5rem" }, mx: 2 }}>
                -
              </Typography>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  Equipo 2
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="error" sx={{ fontSize: { xs: "2rem", sm: "3rem" }, lineHeight: 1.1 }}>
                  {(Array.isArray(newMatchForm.players2)
                    ? newMatchForm.players2
                    : emptyPlayers
                  ).reduce((acc, value) => {
                    if (value.goals === "") return acc;
                    return parseInt(acc ?? 0) + parseInt(value?.goals ?? 0);
                  }, 0) ?? 0}
                </Typography>
              </Box>
            </Box>
            {/* Fecha y botón */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, width: "100%", alignItems: "center" }}>
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
                size="large"
                onClick={handleSave}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  fontWeight: 600,
                  textTransform: "none",
                  minWidth: { xs: "100%", sm: 140 },
                  width: { xs: "100%", sm: "auto" },
                  mt: { xs: 1, sm: 0 },
                }}
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </TabContext>
      <Outlet />

    </Box>
  );
}

export default NewMatch;
