import {
  Button,
  Fab,
  Grid2,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { addNewPlayer } from "../firebase/endpoints";
import { useParams } from "react-router";

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

const AddNewPlayerButton = () => {
  const [openModal, setOpenModal] = useState(false);
  const [newPlayerForm, setNewPlayerForm] = useState("");

  const { admin } = useParams();
  console.log("🚀 ~ AddNewPlayerButton ~ admin:", admin);

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

  if (admin !== "true") return <></>;
  return (
    <>
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "absolute", bottom: 15, right: 15 }}
        onClick={() => setOpenModal(true)}
      >
        <AddIcon />
      </Fab>

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

export default AddNewPlayerButton;
