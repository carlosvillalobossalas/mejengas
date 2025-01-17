import { Button, Grid2, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";

const AssistantsPage = () => {
  const navigate = useNavigate();

  return (
    <Grid2 container flexGrow={1}>
      <Grid2
        container
        alignItems="center"
        justifyContent="space-around"
        flexGrow={1}
        marginTop={2}
      >
        <Button  onClick={() => navigate("/")}>Partido</Button>
        <Typography>Asistencias</Typography>
        <Button  onClick={() => navigate("/scorers")}>Goleadores</Button>
      </Grid2>
    </Grid2>
  );
};

export default AssistantsPage;
