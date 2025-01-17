import { Button, Grid2, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";

const ScorersPage = () => {
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
        <Typography>Goleadores</Typography>
        <Button  onClick={() => navigate("/assistants")}>Assistants</Button>
      </Grid2>
    </Grid2>
  );
};

export default ScorersPage;
