import { TabContext } from "@mui/lab";
import { Box, Grid2, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import CustomTableComponent from "../components/CustomTableComponent";

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

const TablesPage = ({ players }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Grid2 container flexGrow={1} sx={{ padding: 2 }}>
      <Box
        sx={{
          width: "100%",
          typography: "body1",
          // marginTop: 2,
        }}
      >
        <TabContext value={tabIndex}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              variant="scrollable"
              onChange={handleTabChange}
              aria-label="lab API tabs example"
              value={tabIndex}
            >
              <Tab label="Goles" />
              <Tab label="Asistencias" />
              <Tab label="Partidos" />
              <Tab label="Imbatidos" />
            </Tabs>
          </Box>
          <Box sx={{ padding: 0, paddingRight: 1, marginTop: 1 }}>
            {tabIndex === 0 && (
              <CustomTableComponent
                players={players}
                getComparator={getComparator}
                initialOrderBy={"goals"}
                headCells={[
                  {
                    id: "name",
                    align: "left",
                    label: "Nombre",
                    numeric: false,
                    disablePadding: true,
                  },
                  {
                    id: "goals",
                    align: "center",
                    label: "Goles",
                    numeric: true,
                    disablePadding: false,
                  },
                  {
                    id: "matches",
                    align: "center",
                    label: "Partidos",
                    numeric: true,
                    disablePadding: false,
                  },
                ]}
              />
            )}
            {tabIndex === 1 && (
              <CustomTableComponent
                players={players}
                getComparator={getComparator}
                initialOrderBy={"assists"}
                headCells={[
                  {
                    id: "name",
                    align: "left",
                    label: "Nombre",
                    numeric: false,
                    disablePadding: true,
                  },
                  {
                    id: "assists",
                    align: "center",
                    label: "Asistencias",
                    numeric: true,
                    disablePadding: false,
                  },
                  {
                    id: "matches",
                    align: "center",
                    label: "Partidos",
                    numeric: true,
                    disablePadding: false,
                  },
                ]}
              />
            )}
            {tabIndex === 2 && (
              <CustomTableComponent
                players={players}
                getComparator={getComparator}
                initialOrderBy={"won"}
                headCells={[
                  {
                    id: "name",
                    align: "left",
                    label: "Nombre",
                    numeric: false,
                    disablePadding: true,
                  },
                  {
                    id: "won",
                    align: "center",
                    label: "Ganados",
                    numeric: true,
                    disablePadding: false,
                  },
                  {
                    id: "matches",
                    align: "center",
                    label: "Partidos",
                    numeric: true,
                    disablePadding: false,
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
