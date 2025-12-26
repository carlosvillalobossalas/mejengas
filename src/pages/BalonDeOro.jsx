import React, { useEffect, useState } from "react";
import { Box, Typography, Button, FormControl, InputLabel, MenuItem, Select, Paper } from "@mui/material";
import { getAllPlayers } from "../firebase/endpoints";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { useRegisterCompleted } from "../hooks/useRegisterCompleted";


function BalonDeOro() {
    const [players, setPlayers] = useState([]);
    const [votes, setVotes] = useState({ oro: '', plata: '', bronce: '' });
    const [user] = useAuthState(auth)
    const { registerCompleted } = useRegisterCompleted(user)

    useEffect(() => {
        getAllPlayers((allPlayers) => {
            setPlayers(
                user?.uid
                    ? allPlayers.filter((player) => player?.userId !== user.uid)
                    : allPlayers
            );
        });
    }, [user]);

    const handleChange = (medal) => (event) => {
        setVotes((prev) => ({ ...prev, [medal]: event.target.value }));
    };

    const handleSubmit = () => {
        const oro = players.find((p) => p.id === votes.oro)?.name || '';
        const plata = players.find((p) => p.id === votes.plata)?.name || '';
        const bronce = players.find((p) => p.id === votes.bronce)?.name || '';
        // Imprime los votos en consola
        // eslint-disable-next-line no-console
        console.log('Votos:', { oro, plata, bronce });
        alert(`Votaste por:\nOro: ${oro}\nPlata: ${plata}\nBronce: ${bronce}`);
    };

    // Filtrar opciones para que no se repitan
    const getOptions = (excludeIds = []) => players.filter((p) => !excludeIds.includes(p.id));

    if (!registerCompleted) {
        return (
            <Box sx={{ p: 2, minHeight: "80vh", bgcolor: "grey.50", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Paper sx={{ p: { xs: 2, sm: 4 }, maxWidth: 400, width: "100%", display: "flex", flexDirection: "column", gap: 3 }} elevation={3}>
                    <Typography variant="h5" color="error" fontWeight={700} align="center" mb={1}>
                        Registro Incompleto
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary">
                        Espera o avisa al comité para completar tu registro.
                    </Typography>
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
                <Typography variant="body1" align="center" color="text.secondary">
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
                    disabled={!votes.oro || !votes.plata || !votes.bronce}
                    onClick={handleSubmit}
                >
                    Enviar Votos
                </Button>
            </Paper>
        </Box>
    );
}

export default BalonDeOro;
