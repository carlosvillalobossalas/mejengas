import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Container,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    Grid2,
    Button,
    Collapse,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { getBallonDeOroResults, saveBallonDeOroWinners, getBallonDeOroWinners } from "../firebase/endpoints";
import { getAllPlayers } from "../firebase/playerEndpoints";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SaveIcon from "@mui/icons-material/Save";
import { getPlayerDisplay } from "../utils/playersDisplayName";
import { toast } from "react-toastify";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { useAdmin } from "../hooks/useAdmin";

function BallonDeOroResults() {
    const [results, setResults] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedVotes, setExpandedVotes] = useState({});
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [savingWinners, setSavingWinners] = useState(false);
    const [winnersAlreadySaved, setWinnersAlreadySaved] = useState(false);
    const navigate = useNavigate();
    const [user, ] = useAuthState(auth);
    const isAdmin = useAdmin(user);

    useEffect(() => {
        getAllPlayers(setPlayers);

        const fetchResults = async () => {
            try {
                const data = await getBallonDeOroResults(2025);
                setResults(data);

                // Verificar si ya se guardaron los ganadores
                const winners = await getBallonDeOroWinners(2025);
                setWinnersAlreadySaved(!!winners);
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const getPlayerName = (playerId) => {
        const player = players.find((p) => p.id === playerId);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player?.name);
        if (!isEmail && player?.name) {
            return player.name;
        }
        return player?.originalName || player?.name || "Desconocido";
    };

    const getMedalColor = (position) => {
        switch (position) {
            case 0:
                return "#FFD700";
            case 1:
                return "#C0C0C0";
            case 2:
                return "#CD7F32";
            default:
                return "#9E9E9E";
        }
    };

    const createRanking = (playerPoints) =>
        Object.entries(playerPoints)
            .map(([playerId, points]) => ({
                playerId,
                points,
                name: getPlayerName(playerId),
            }))
            .sort((a, b) => b.points - a.points);

    const toggleVote = (voteIndex) => {
        setExpandedVotes((prev) => ({
            ...prev,
            [voteIndex]: !prev[voteIndex],
        }));
    };

    const getVoterName = (vote) => {
        const player = players.find(p => p.userId === vote.userId);
        return getPlayerDisplay(player) || "Anónimo";
    };

    const handleSaveWinners = async () => {
        if (!results || !results.playerPoints) return;

        setSavingWinners(true);
        try {
            const ranking = createRanking(results.playerPoints);
            
            if (ranking.length < 3) {
                toast.error("No hay suficientes jugadores para guardar los ganadores");
                return;
            }

            await saveBallonDeOroWinners(
                2025,
                ranking[0].playerId,
                ranking[1].playerId,
                ranking[2].playerId
            );

            toast.success("¡Ganadores registrados exitosamente! 🏆");
            setWinnersAlreadySaved(true);
            setOpenConfirmDialog(false);
        } catch (error) {
            console.error("Error saving winners:", error);
            toast.error("Error al guardar los ganadores");
        } finally {
            setSavingWinners(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "80vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // if (!results) {
    //     return (
    //         <Container maxWidth="lg" sx={{ py: 2 }}>
    //             <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/balon-de-oro")}>
    //                 Volver
    //             </Button>
    //             <Typography variant="h5" align="center" color="error">
    //                 Error cargando los resultados
    //             </Typography>
    //         </Container>
    //     );
    // }

    const ranking = createRanking(results.playerPoints);
    const [gold, silver, bronze] = ranking;

    return (
        <Box sx={{ bgcolor: "grey.50", height: "100dvh" }} overflow={'auto'}>
            {/* Botón de guardar ganadores (solo para admins) */}
            {isAdmin && !winnersAlreadySaved && (
                <Box sx={{ px: 2, pt: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={() => setOpenConfirmDialog(true)}
                        fullWidth
                        color="success"
                    >
                        Registrar Ganadores Oficiales
                    </Button>
                </Box>
            )}

            {isAdmin && winnersAlreadySaved && (
                <Box sx={{ px: 2, pt: 2 }}>
                    <Chip 
                        label="✅ Ganadores ya registrados" 
                        color="success" 
                        sx={{ width: '100%', py: 2 }}
                    />
                </Box>
            )}

            <Typography
                variant="h4"
                align="center"
                fontWeight={700}
                mb={1}
                px={2}
                py={3}
                color="primary.main"
            >
                🏆 Balón de Oro 2025
            </Typography>
            <Typography
                variant="body1"
                align="center"
                color="text.secondary"
                mb={4}
                px={2}
            >
                Total de votos: {results.totalVotes}
            </Typography>

            <Grid2 container spacing={1} justifyContent={'center'} alignItems={'flex-end'} mb={4}>
                {silver && (
                    <Grid2 sx={{ width: 110 }}>
                        <Card sx={{ bgcolor: getMedalColor(1), height: 180 }}>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h4">🥈</Typography>
                                <Typography
                                    fontWeight={700}
                                    sx={{
                                        textAlign: "center",
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 2,
                                        overflow: "hidden",
                                    }}
                                >{silver.name}</Typography>
                                <Chip label={`${silver.points} pts`} size="small" sx={{ mt: 1 }} />
                            </CardContent>
                        </Card>
                    </Grid2>
                )}
                {gold && (
                    <Grid2 sx={{ width: 145 }}>
                        <Card
                            sx={{
                                bgcolor: getMedalColor(0),
                                height: 240,
                                boxShadow: "0 12px 30px rgba(255,215,0,0.5)",
                            }}
                        >
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h3">🥇</Typography>
                                <Typography
                                    variant="h5"
                                    fontWeight={900}
                                    sx={{
                                        textAlign: "center",
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 2,
                                        overflow: "hidden",
                                    }}
                                >
                                    {gold.name}
                                </Typography>
                                <Chip
                                    label={`${gold.points} puntos`}
                                    sx={{ mt: 2, fontWeight: 700 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid2>
                )}

                {bronze && (
                    <Grid2 sx={{ width: 110 }}>
                        <Card sx={{ bgcolor: getMedalColor(2), height: 150 }}>
                            <CardContent sx={{ textAlign: "center" }}>
                                <Typography variant="h5">🥉</Typography>
                                <Typography
                                    fontWeight={700}
                                    sx={{
                                        textAlign: "center",
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 2,
                                        overflow: "hidden",
                                    }}
                                >
                                    {bronze.name}
                                </Typography>
                                <Chip label={`${bronze.points} pts`} size="small" sx={{ mt: 1 }} />
                            </CardContent>
                        </Card>
                    </Grid2>
                )}
            </Grid2>

            <Typography variant="h6" fontWeight={700} mb={2} color="primary.main" px={2}>
                📊 Ranking General
            </Typography>

            <Grid2 container spacing={1} px={2} mb={3} flexDirection={'column'} overflow="auto">
                {ranking.map((player, index) => (
                    <Box
                        key={player.playerId}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 1.5,
                            bgcolor: "#fff",
                            borderRadius: 1,
                            borderLeft: `4px solid ${getMedalColor(index)}`,
                        }}
                    >
                        <Typography fontWeight={700} minWidth={40}>
                            #{index + 1}
                        </Typography>

                        <Typography sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {player.name}
                        </Typography>

                        <Chip
                            label={`${player.points} ptos`}
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                ))}
            </Grid2>

            <Typography variant="h6" fontWeight={700} mb={2} color="primary.main" px={2}>
                🗳️ Revelación de votos
            </Typography>

            <Grid2 container spacing={1} px={2} mb={10} flexDirection={'column'}>
                {results.votes && results.votes.map((vote, index) => (
                    <Box key={index}>
                        <Box
                            onClick={() => toggleVote(index)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 1.5,
                                bgcolor: "#fff",
                                borderRadius: 1,
                                cursor: "pointer",
                                "&:hover": {
                                    bgcolor: "grey.100",
                                },
                            }}
                        >
                            <Typography fontWeight={600}>
                                {getVoterName(vote)}
                            </Typography>
                            <IconButton size="small">
                                {expandedVotes[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>
                        <Collapse in={expandedVotes[index]}>
                            <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1, mt: 0.5 }}>
                                {vote.primero && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Chip label="1º" size="small" sx={{ bgcolor: "#FFD700", minWidth: 40 }} />
                                        <Typography>{getPlayerName(vote.primero)} (6 pts)</Typography>
                                    </Box>
                                )}
                                {vote.segundo && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Chip label="2º" size="small" sx={{ bgcolor: "#C0C0C0", minWidth: 40 }} />
                                        <Typography>{getPlayerName(vote.segundo)} (4 pts)</Typography>
                                    </Box>
                                )}
                                {vote.tercero && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Chip label="3º" size="small" sx={{ bgcolor: "#CD7F32", minWidth: 40 }} />
                                        <Typography>{getPlayerName(vote.tercero)} (3 pts)</Typography>
                                    </Box>
                                )}
                                {vote.cuarto && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <Chip label="4º" size="small" sx={{ bgcolor: "#E0E0E0", minWidth: 40 }} />
                                        <Typography>{getPlayerName(vote.cuarto)} (2 pts)</Typography>
                                    </Box>
                                )}
                                {vote.quinto && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Chip label="5º" size="small" sx={{ bgcolor: "#F5F5F5", minWidth: 40 }} />
                                        <Typography>{getPlayerName(vote.quinto)} (1 pt)</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Collapse>
                    </Box>
                ))}
            </Grid2>

            {/* Dialog de confirmación para guardar ganadores */}
            <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
                <DialogTitle>Confirmar Registro de Ganadores</DialogTitle>
                <DialogContent>
                    <Typography mb={2}>
                        ¿Estás seguro de que deseas registrar oficialmente a estos jugadores como ganadores del Balón de Oro 2025?
                    </Typography>
                    <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 1 }}>
                        <Typography fontWeight={700} mb={1}>🥇 Balón de Oro</Typography>
                        <Typography mb={2}>{gold?.name} ({gold?.points} pts)</Typography>
                        
                        <Typography fontWeight={700} mb={1}>🥈 Balón de Plata</Typography>
                        <Typography mb={2}>{silver?.name} ({silver?.points} pts)</Typography>
                        
                        <Typography fontWeight={700} mb={1}>🥉 Balón de Bronce</Typography>
                        <Typography>{bronze?.name} ({bronze?.points} pts)</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" mt={2} display="block">
                        Esta acción actualizará los perfiles de los jugadores con sus premios.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog(false)} disabled={savingWinners}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSaveWinners} 
                        variant="contained" 
                        disabled={savingWinners}
                        startIcon={savingWinners ? <CircularProgress size={20} /> : <SaveIcon />}
                    >
                        {savingWinners ? "Guardando..." : "Confirmar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default BallonDeOroResults;
