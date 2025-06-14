import { Box, Grid2, Typography } from "@mui/material";
import { SportsSoccer, Stadium } from "@mui/icons-material";
import AssistIcon from "/assets/shoe.png";
import CustomTableComponent from "../components/CustomTableComponent";

//TODO: agregar mas stats: ganados, perdidos, empatados
export const PlayersTablePage = ({ players }) => {
  return (
    <Grid2
      container
      flexDirection="column"
      sx={{ height: "100%", overflow: "hidden" }}
    >
      <Box
        sx={{
          paddingY: 1,
          width: "100%",
        }}
      >
        <Typography variant="h6" textAlign={"center"} fontWeight={"bold"}>
          Jugadores
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", width: "100%" }}>
        <CustomTableComponent
          players={players}
          title="Jugadores"
          initialOrderBy={"goals"}
          headCells={[
            {
              id: "name",
              align: "left",
              label: "Jugador",
              numeric: false,
              disablePadding: true,
              icon: null,
            },
            {
              id: "goals",
              align: "center",
              label: "Goles",
              numeric: true,
              disablePadding: false,
              icon: <SportsSoccer />,
            },
            {
              id: "assists",
              align: "center",
              label: "Asistencias",
              numeric: true,
              disablePadding: false,
              icon: <img src={AssistIcon} />,
            },
            {
              id: "matches",
              align: "center",
              label: "Partidos",
              numeric: true,
              disablePadding: false,
              icon: <Stadium />,
            },
          ]}
        />
      </Box>
    </Grid2>
  );
};
