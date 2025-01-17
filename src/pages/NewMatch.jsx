import {
  Box,
  Button,
  Grid2,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Outlet } from "react-router";
import { getAllPlayers } from "../firebase/endpoints";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";

const NewMatch = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [newMatchForm, setNewMatchForm] = useState({
    date: dayjs(new Date()),
    players1: [],
  });
  useEffect(() => {
    getAllPlayers().then((res) => setPlayers(res));
  }, []);

  useEffect(() => {
    console.log(players);
  }, [players]);

  const handleSave = ()=>{
    console.log(newMatchForm)
  }

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
          marginTop={5}
          direction="column"
        >
          <DatePicker
            label="Fecha"
            value={newMatchForm.date}
            onChange={(value) =>
              setNewMatchForm((prev) => ({ ...prev, date: value }))
            }
          />
          <Grid2
            container
            sx={{ width: "100%" }}
            direction="column"
            marginTop={2}
            spacing={2}
          >
            <Typography paddingLeft={2}>Equipo 1</Typography>
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
                  <Select
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
          <Box marginTop={5}>
            <Button variant="contained" onClick={handleSave}>Guardar</Button>
          </Box>
        </Grid2>
      </Grid2>
      <Outlet />
    </>
  );
};

export default NewMatch;
