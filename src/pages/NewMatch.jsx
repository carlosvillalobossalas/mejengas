import {
  Button,
  Fab,
  Grid2,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import AddIcon from "@mui/icons-material/Add";
import { addNewPlayer } from "../firebase/endpoints";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const NewMatch = () => {
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [newPlayerForm, setNewPlayerForm] = useState("");

  const saveNewPlayer = async () => {
    if (newPlayerForm.length > 0) {
      //TODO: agregar toast
      const response = await addNewPlayer(newPlayerForm);
      if (response) {
        setNewPlayerForm("");
        setOpenModal(false);
      }
    }
  };

  return (
    <>
      <Grid2 container flexGrow={1}>
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

        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: "absolute", bottom: 15, right: 15 }}
          onClick={() => setOpenModal(true)}
        >
          <AddIcon />
        </Fab>
      </Grid2>
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Grid2 container sx={style} spacing={3} direction="column">
          <Typography>Registrar nuevo Jugador</Typography>
          <TextField
            placeholder="Nombre"
            value={newPlayerForm}
            onChange={({ target }) => setNewPlayerForm(target.value)}
          />
          <Button variant="contained" onClick={saveNewPlayer}>
            Guardar
          </Button>
        </Grid2>
      </Modal>
    </>
  );
};

export default NewMatch;
