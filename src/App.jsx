import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router";
import NewMatch from "./pages/NewMatch";
import TablesPage from "./pages/TablesPage";
import AddNewPlayerButton from "./components/AddNewPlayerButton";
import { Button, Grid2, Typography } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { getAllGKs, getAllMatches, getAllPlayers } from "./firebase/endpoints";

const App = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [goalkeepers, setGoalkeepers] = useState([]);
  const [matches, setMatches] = useState([]);
  const { pathname } = window.location;

  useEffect(() => {
    const unsubscribe = getAllPlayers(setPlayers);

    return () => unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = getAllGKs(setGoalkeepers);

    return () => unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = getAllMatches(setMatches);

    return () => unsubscribe;
  }, []);

  return (
    <>
      {/* <Grid2
        container
        alignItems="center"
        justifyContent="space-around"
        flexGrow={1}
        marginTop={2}
      >
        <Button
          variant={pathname === "/admin/false" ? "contained" : "outlined"}
          onClick={() => navigate("/admin/false")}
          disabled={pathname !== "/admin"}
        >
          Partido
        </Button>
        <Button
          variant={pathname === "/" ? "contained" : "outlined"}
          onClick={() => navigate("/")}
        >
          Tablas
        </Button>
      </Grid2> */}
      <Routes>
        <Route
          path=""
          element={
            <TablesPage
              players={players}
              goalkeepers={goalkeepers}
              matches={matches}
            />
          }
        />
        <Route path="admin/:admin">
          <Route path="" element={<NewMatch players={players} />}>
            <Route path="" element={<AddNewPlayerButton />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer position="top-right" />
    </>
  );
};

export default App;
