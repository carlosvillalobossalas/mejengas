import React from "react";
import { Route, Routes, useNavigate, useParams } from "react-router";
import NewMatch from "./pages/NewMatch";
import ScorersPage from "./pages/ScorersPage";
import AssistantsPage from "./pages/AssistantsPage";
import AddNewPlayerButton from "./components/AddNewPlayerButton";
import { Button, Grid2 } from "@mui/material";

const App = () => {
  const navigate = useNavigate();
  const { pathname } = window.location;
  console.log(window.location.pathname);

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
        >
          Partido
        </Button>
        <Button
          variant={pathname === "/" ? "contained" : "outlined"}
          onClick={() => navigate("/")}
        >
          Goleadores
        </Button>
        <Button
          variant={pathname === "/assistants" ? "contained" : "outlined"}
          onClick={() => navigate("/assistants")}
        >
          Asistencias
        </Button>
      </Grid2>
      <Routes>
        <Route path="" element={<ScorersPage />} />
        <Route path="assistants" element={<AssistantsPage />} />
        <Route path="admin/:admin">
          <Route path="" element={<NewMatch />}>
            <Route path=":admin/newplayer" element={<AddNewPlayerButton />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
