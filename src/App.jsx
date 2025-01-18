import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router";
import NewMatch from "./pages/NewMatch";
import TablesPage from "./pages/TablesPage";
import AddNewPlayerButton from "./components/AddNewPlayerButton";
import { Button, Grid2 } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { getAllPlayers } from "./firebase/endpoints";

const App = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  const { pathname } = window.location;

  useEffect(() => {
    const unsubscribe = getAllPlayers(setPlayers);

    return () => unsubscribe;
  }, []);

  return (
    <>
      <Grid2
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
      </Grid2>
      <Routes>
        <Route path="" element={<TablesPage players={players} />} />
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
