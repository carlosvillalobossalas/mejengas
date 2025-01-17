import React from "react";
import { Route, Routes } from "react-router";
import NewMatch from "./pages/NewMatch";
import ScorersPage from "./pages/ScorersPage";
import AssistantsPage from "./pages/AssistantsPage";
import AddNewPlayerButton from "./components/AddNewPlayerButton";

const App = () => {
  return (
    <Routes>
      <Route path="" element={<ScorersPage />} />
      <Route path="assistants" element={<AssistantsPage />} />
      <Route path="admin">
        <Route path="" element={<NewMatch />}>
          <Route path=":admin/newplayer" element={<AddNewPlayerButton />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
