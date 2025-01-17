import React from "react";
import { Route, Routes } from "react-router";
import NewMatch from "./pages/NewMatch";
import ScorersPage from "./pages/ScorersPage";
import AssistantsPage from "./pages/AssistantsPage";

const App = () => {
  return (
    <Routes>
      <Route path="" element={<NewMatch />} />
      <Route path="scorers" element={<ScorersPage />} />
      <Route path="assistants" element={<AssistantsPage />} />
    </Routes>
  );
};

export default App;
