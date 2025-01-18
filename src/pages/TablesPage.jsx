import { TabContext } from "@mui/lab";
import { Box, Grid2, Tab, Tabs } from "@mui/material";
import { SportsSoccer, CrisisAlert, Stadium } from "@mui/icons-material";
import React, { useState } from "react";
import CustomTableComponent from "../components/CustomTableComponent";
import HistoricMatchesList from "../components/HistoricMatchesList";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const TablesPage = ({ players, goalkeepers, matches }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Grid2 container flexGrow={1}>
      <Box
        sx={{
          width: "100%",
          typography: "body1",
          paddingTop: 1,
        }}
      >
        <TabContext value={tabIndex} col>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              variant="scrollable"
              onChange={handleTabChange}
              aria-label="lab API tabs example"
              value={tabIndex}
            >
              <Tab label="Historico" />
              <Tab label="Stats" />
              <Tab label="Porteros" />
              <Tab label="Partidos" />
            </Tabs>
          </Box>
          <Box sx={{ padding: 0 }}>
            {tabIndex === 0 && <HistoricMatchesList matches={matches} />}

            {tabIndex === 1 && (
              <CustomTableComponent
                players={players}
                title="Jugadores"
                getComparator={getComparator}
                initialOrderBy={"goals"}
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
                    icon: <CrisisAlert />,
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
            )}

            {tabIndex === 2 && (
              <CustomTableComponent
                title="Porteros"
                players={goalkeepers}
                getComparator={getComparator}
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
            )}
            {tabIndex === 3 && (
              <CustomTableComponent
                players={players.map((p) => ({
                  ...p,
                  lost: p.matches - p.won,
                }))}
                title="Ganados"
                getComparator={getComparator}
                initialOrderBy={"won"}
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
                    id: "won",
                    align: "center",
                    label: "Ganados",
                    numeric: true,
                    disablePadding: false,
                    icon: null,
                  },
                  {
                    id: "lost",
                    align: "center",
                    label: "Perdidos",
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
            )}
          </Box>
        </TabContext>
      </Box>
    </Grid2>
  );
};

export default TablesPage;
