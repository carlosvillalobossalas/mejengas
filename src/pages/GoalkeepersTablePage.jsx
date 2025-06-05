import CustomTableComponent from "../components/CustomTableComponent";
import { Box, Grid2, Typography } from "@mui/material";

export const GoalkeepersTablePage = ({ goalkeepers }) => {
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
          Porteros
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", width: "100%" }}>
        <CustomTableComponent
          title="Porteros"
          players={goalkeepers}
          initialOrderBy={"cleanSheet"}
          headCells={[
            {
              id: "name",
              align: "left",
              label: "Nombre",
              numeric: false,
              disablePadding: true,
              icon: null,
            },
            {
              id: "cleanSheet",
              align: "center",
              label: "Imbatido",
              numeric: true,
              disablePadding: false,
              icon: null,
            },
            {
              id: "goals",
              align: "center",
              label: "Recibidos",
              numeric: true,
              disablePadding: false,
              icon: null,
            },
            {
              id: "won",
              align: "center",
              label: "Ganados",
              numeric: true,
              disablePadding: false,
              icon: null,
            },
            {
              id: "matches",
              align: "center",
              label: "Total",
              numeric: true,
              disablePadding: false,
              icon: null,
            },
          ]}
        />
      </Box>
    </Grid2>
  );
};
