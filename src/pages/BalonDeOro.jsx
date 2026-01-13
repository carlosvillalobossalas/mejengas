import React, { useEffect, useState } from "react";
import { Box, Typography, Button, FormControl, InputLabel, MenuItem, Select, Paper, CircularProgress } from "@mui/material";
import { saveBallonDeOroVotes, checkIfUserVoted } from "../firebase/endpoints";
import { getAllPlayers } from "../firebase/playerEndpoints";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { useRegisterCompleted } from "../hooks/useRegisterCompleted";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectActiveGroupId } from "../store/slices/groupsSlice";


function BalonDeOro() {
    const [players, setPlayers] = useState([]);
    const [votes, setVotes] = useState({ primero: '', segundo: '', tercero: '', cuarto: '', quinto: '' });
    const [user] = useAuthState(auth)
    const { registerCompleted } = useRegisterCompleted(user)
    const [loading, setLoading] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const navigate = useNavigate();
    const activeGroupId = useSelector(selectActiveGroupId);

    useEffect(() => {
        if (!user) return;
        
        let playersLoaded = false;
        let voteChecked = false;

        const checkInitialized = () => {
            if (playersLoaded && voteChecked) {
                setInitialized(true);
            }
        };

        const unsubscribe = getAllPlayers((allPlayers) => {
            setPlayers(
                user?.uid
                    ? allPlayers.filter((player) => player?.userId !== user.uid)
                    : allPlayers
            );
            playersLoaded = true;
            checkInitialized();
        }, activeGroupId);

        const checkVote = async () => {
            try {
                const result = await checkIfUserVoted(user.uid);
                setHasVoted(result.hasVoted);
                if (result.vote) {
                    setVotes({
                        primero: result.vote.primero || '',
                        segundo: result.vote.segundo || '',
                        tercero: result.vote.tercero || '',
                        cuarto: result.vote.cuarto || '',
                        quinto: result.vote.quinto || '',
                    });
                }
            } catch (error) {
                console.error("Error checking vote:", error);
            } finally {
                voteChecked = true;
                checkInitialized();
            }
        };

        checkVote();
        return () => unsubscribe && unsubscribe();
    }, [user, activeGroupId]);

    const handleChange = (medal) => (event) => {
        setVotes((prev) => ({ ...prev, [medal]: event.target.value }));
    };

    const handleSubmit = async () => {
        if (!user?.uid) {
            toast.error("Usuario no autenticado");
            return;
        }

        setLoading(true);
        try {
            const result = await saveBallonDeOroVotes(user.uid, votes);
            toast.success(result.message);
            setHasVoted(true);
        } catch (error) {
            console.error("Error saving votes:", error);
            toast.error("Error al guardar los votos");
        } finally {
            setLoading(false);
        }
    };

    // Filtrar opciones para que no se repitan
    const getOptions = (excludeIds = []) => players.filter((p) => !excludeIds.includes(p.id));

    const getPlayerDisplay = (player) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player?.name);
        if (!isEmail && player?.name) {
            return player.name;
        }
        return player?.originalName || player?.name || 'Sin nombre';
    };

    // Validar si puede ver resultados (31 de diciembre a las 18:00)
    const canViewResults = new Date() >= new Date(2025, 11, 31, 18, 0, 0);

    if (!initialized) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <CircularProgress />
            </Box>
        )
    }

    if (hasVoted) {
        return (
            <Box sx={{ p: 2, minHeight: "80vh", bgcolor: "grey.50", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 3 }} elevation={3}>
                    <Typography variant="h4" color="success.main" fontWeight={700} align="center" mb={1}>
                        ✓ Ya Votaste
                    </Typography>
                    <Typography variant="h6" align="center" color="text.secondary">
                        Tu voto para el Balón de Oro 2025 ha sido registrado correctamente.
                    </Typography>
                    <Box sx={{ p: 2, bgcolor: "success.50", borderRadius: 1 }}>
                        <Typography variant="h6" fontWeight="bold" mb={1}>Tu votación:</Typography>
                        <Typography variant="body1" display="block">🥇 Primer lugar: {getPlayerDisplay(players.find(p => p.id === votes.primero)) || '-'}</Typography>
                        <Typography variant="body1" display="block">🥈 Segundo lugar: {getPlayerDisplay(players.find(p => p.id === votes.segundo)) || '-'}</Typography>
                        <Typography variant="body1" display="block">🥉 Tercer lugar: {getPlayerDisplay(players.find(p => p.id === votes.tercero)) || '-'}</Typography>
                        <Typography variant="body1" display="block">4️⃣ Cuarto lugar: {getPlayerDisplay(players.find(p => p.id === votes.cuarto)) || '-'}</Typography>
                        <Typography variant="body1" display="block">5️⃣ Quinto lugar: {getPlayerDisplay(players.find(p => p.id === votes.quinto)) || '-'}</Typography>
                    </Box>
                    {/* {canViewResults && (
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={() => navigate("/balon-de-oro/resultados")}
                        >
                            Ver Resultados
                        </Button>
                    )} */}
                </Paper>
            </Box>
        )
    }

    if (!canViewResults && hasVoted) {
        return (
            <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", overflow: "auto", p: 2, display: "flex", justifyContent: "center" }}>
                <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 3, boxShadow: 3, borderRadius: 2 }}>
                    <Typography variant="h4" color="error" fontWeight={700} align="center" mb={1}>
                        🔒 Votación Cerrada
                    </Typography>
                    <Typography variant="h6" align="center" color="text.secondary">
                        El período de votación para el Balón de Oro 2025 ha finalizado.
                    </Typography>
                    {/* <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={() => navigate("/balon-de-oro/resultados")}
                    >
                        Ver Resultados
                    </Button> */}
                </Box>
            </Box>
        )
    }
    if (!registerCompleted) {
        return (
            <Box sx={{ p: 2, minHeight: "80vh", bgcolor: "grey.50", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 3 }} elevation={3}>
                    <Typography variant="h4" color="error" fontWeight={700} align="center" mb={1}>
                        Registro Incompleto
                    </Typography>
                    <Typography variant="h6" align="center" color="text.secondary">
                        Espera o avisa al comité para completar tu registro.
                    </Typography>
                </Paper>
            </Box>
        )
    }

    return (
        <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", overflow: "auto", p: 2, display: "flex", justifyContent: "center" }}>
            <Box sx={{ maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={1}>
                    Balón de Oro
                </Typography>
                <Typography variant="h6" align="center" color="text.secondary">
                    Año 2025
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="primero-label">Primer Lugar</InputLabel>
                    <Select
                        labelId="primero-label"
                        value={votes.primero}
                        label="Primer Lugar"
                        onChange={handleChange('primero')}
                    >
                        {getOptions([votes.segundo, votes.tercero, votes.cuarto, votes.quinto]).map((player) => (
                            <MenuItem key={player.id} value={player.id}>{getPlayerDisplay(player)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="segundo-label">Segundo Lugar</InputLabel>
                    <Select
                        labelId="segundo-label"
                        value={votes.segundo}
                        label="Segundo Lugar"
                        onChange={handleChange('segundo')}
                    >
                        {getOptions([votes.primero, votes.tercero, votes.cuarto, votes.quinto]).map((player) => {
                            return (
                                <MenuItem key={player.id} value={player.id}>{getPlayerDisplay(player)}</MenuItem>
                            )
                        })}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="tercero-label">Tercer Lugar</InputLabel>
                    <Select
                        labelId="tercero-label"
                        value={votes.tercero}
                        label="Tercer Lugar"
                        onChange={handleChange('tercero')}
                    >
                        {getOptions([votes.primero, votes.segundo, votes.cuarto, votes.quinto]).map((player) => (
                            <MenuItem key={player.id} value={player.id}>{getPlayerDisplay(player)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="cuarto-label">Cuarto Lugar</InputLabel>
                    <Select
                        labelId="cuarto-label"
                        value={votes.cuarto}
                        label="Cuarto Lugar"
                        onChange={handleChange('cuarto')}
                    >
                        {getOptions([votes.primero, votes.segundo, votes.tercero, votes.quinto]).map((player) => (
                            <MenuItem key={player.id} value={player.id}>{getPlayerDisplay(player)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="quinto-label">Quinto Lugar</InputLabel>
                    <Select
                        labelId="quinto-label"
                        value={votes.quinto}
                        label="Quinto Lugar"
                        onChange={handleChange('quinto')}
                    >
                        {getOptions([votes.primero, votes.segundo, votes.tercero, votes.cuarto]).map((player) => (
                            <MenuItem key={player.id} value={player.id}>{getPlayerDisplay(player)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 2, fontWeight: 700 }}
                    disabled={!votes.primero || !votes.segundo || !votes.tercero || !votes.cuarto || !votes.quinto || loading}
                    onClick={handleSubmit}
                >
                    {loading ? <CircularProgress size={24} /> : 'Enviar Votos'}
                </Button>
                {/* {canViewResults && (
                    <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        sx={{ mt: 1, fontWeight: 700 }}
                        onClick={() => navigate("/balon-de-oro/resultados")}
                    >
                        Ver Resultados
                    </Button>
                )} */}
            </Box>
        </Box>
    );
}

export default BalonDeOro;
