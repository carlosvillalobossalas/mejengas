import { BottomNavigation, BottomNavigationAction, Box } from "@mui/material";
import { getAllGKs, getAllMatches, getAllPlayers } from "./firebase/endpoints";
import { GoalkeepersTablePage } from "./pages/GoalkeepersTablePage";
import { PlayersTablePage } from "./pages/PlayersTablePage";
import { Route, Routes, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import AddNewPlayerButton from "./components/AddNewPlayerButton";
import HistoricMatchesList from "./components/HistoricMatchesList";
import NewMatch from "./pages/NewMatch";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

const App = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [goalkeepers, setGoalkeepers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentTabValue, setCurrentTabValue] = useState(0);

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
    <Box sx={{ height: "100vh", overflow: "hidden", position: "relative" }}>
      <Box sx={{ height: "calc(100vh - 56px)", overflow: "hidden" }}>
        <Routes>
          <Route path="" element={<HistoricMatchesList matches={matches} />} />
          <Route
            path="/jugadores"
            element={<PlayersTablePage players={players} />}
          />
          <Route
            path="/porteros"
            element={<GoalkeepersTablePage goalkeepers={goalkeepers} />}
          />
          <Route path="admin/:admin">
            <Route path="" element={<NewMatch players={players} />}>
              <Route path="" element={<AddNewPlayerButton />} />
            </Route>
          </Route>
        </Routes>
      </Box>
      <BottomNavigation
        showLabels
        value={currentTabValue}
        onChange={(event, newValue) => {
          setCurrentTabValue(newValue);
          switch (newValue) {
            case 0:
              navigate("/");
              break;
            case 1:
              navigate("/jugadores");
              break;
            case 2:
              navigate("/porteros");
              break;
            default:
              navigate("/");
              break;
          }
        }}
        sx={{ width: "100%", position: "absolute", bottom: 0 }}
      >
        <BottomNavigationAction label="Partidos" icon={<ScoreboardIcon />} />
        <BottomNavigationAction
          label="Goles/Asistencias"
          icon={<SportsSoccerIcon />}
        />
        <BottomNavigationAction
          label="Porteros"
          icon={<SportsHandballIcon />}
        />
      </BottomNavigation>
      <ToastContainer position="top-right" />
    </Box>
  );
};

export default App;
