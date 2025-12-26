import React, { useEffect, useState } from "react";
import { Box, Typography, Button, FormControl, InputLabel, MenuItem, Select, Paper, CircularProgress } from "@mui/material";
import { getAllPlayers, saveBallonDeOroVotes, checkIfUserVoted } from "../firebase/endpoints";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { useRegisterCompleted } from "../hooks/useRegisterCompleted";
import { toast } from "react-toastify";


function BalonDeOro() {
    const [players, setPlayers] = useState([]);
    const [votes, setVotes] = useState({ oro: '', plata: '', bronce: '' });
    const [user] = useAuthState(auth)
    const { registerCompleted } = useRegisterCompleted(user)
    const [loading, setLoading] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        getAllPlayers((allPlayers) => {
            setPlayers(
                user?.uid
                    ? allPlayers.filter((player) => player?.userId !== user.uid)
                    : allPlayers
            );
        });
    }, [user]);

    // Verificar si el usuario ya votó
    useEffect(() => {
        const checkVote = async () => {
            if (user?.uid) {
                try {
                    const result = await checkIfUserVoted(user.uid);
                    setHasVoted(result.hasVoted);
                    if (result.vote) {
                        setVotes({
                            oro: result.vote.oro || '',
                            plata: result.vote.plata || '',
                            bronce: result.vote.bronce || '',
                        });
                    }
                } catch (error) {
                    console.error("Error checking vote:", error);
                }
            }
        };
        checkVote();
    }, [user]);

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
                        <Typography variant="body1" display="block">🥇 Oro: {players.find(p => p.id === votes.oro)?.name || '-'}</Typography>
                        <Typography variant="body1" display="block">🥈 Plata: {players.find(p => p.id === votes.plata)?.name || '-'}</Typography>
                        <Typography variant="body1" display="block">🥉 Bronce: {players.find(p => p.id === votes.bronce)?.name || '-'}</Typography>
                    </Box>
                </Paper>
            </Box>
        )
    }

    return (
        <Box sx={{ p: 2, minHeight: "100vh", bgcolor: "grey.50", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 3 }} elevation={3}>
                <Typography variant="h4" color="primary" fontWeight={700} align="center" mb={1}>
                    Balón de Oro
                </Typography>
                <Typography variant="h6" align="center" color="text.secondary">
                    Año 2025
                </Typography>
                <Typography variant="h6" align="center" color="text.secondary">
                    Elige tu podio: selecciona un jugador diferente para cada medalla.
                </Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="oro-label">Balón de Oro</InputLabel>
                    <Select
                        labelId="oro-label"
                        value={votes.oro}
                        label="Balón de Oro"
                        onChange={handleChange('oro')}
                    >
                        {getOptions([votes.plata, votes.bronce]).map((player) => (
                            <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="plata-label">Balón de Plata</InputLabel>
                    <Select
                        labelId="plata-label"
                        value={votes.plata}
                        label="Balón de Plata"
                        onChange={handleChange('plata')}
                    >
                        {getOptions([votes.oro, votes.bronce]).map((player) => (
                            <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="bronce-label">Balón de Bronce</InputLabel>
                    <Select
                        labelId="bronce-label"
                        value={votes.bronce}
                        label="Balón de Bronce"
                        onChange={handleChange('bronce')}
                    >
                        {getOptions([votes.oro, votes.plata]).map((player) => (
                            <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 2, fontWeight: 700 }}
                    disabled={!votes.oro || !votes.plata || !votes.bronce || loading}
                    onClick={handleSubmit}
                >
                    {loading ? <CircularProgress size={24} /> : 'Enviar Votos'}
                </Button>
            </Paper>
        </Box>
    );
}

export default BalonDeOro;
