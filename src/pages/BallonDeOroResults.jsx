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
} from "@mui/material";
import { getBallonDeOroResults, getAllPlayers } from "../firebase/endpoints";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function BallonDeOroResults() {
    const [results, setResults] = useState(null);
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getAllPlayers(setPlayers);

        const fetchResults = async () => {
            try {
                const data = await getBallonDeOroResults();
                setResults(data);
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

    if (!results) {
        return (
            <Container maxWidth="lg" sx={{ py: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/balon-de-oro")}>
                    Volver
                </Button>
                <Typography variant="h5" align="center" color="error">
                    Error cargando los resultados
                </Typography>
            </Container>
        );
    }

    const ranking = createRanking(results.playerPoints);
    const [gold, silver, bronze] = ranking;

    return (
        <Box sx={{ bgcolor: "grey.50", height: "100dvh" }} overflow={'auto'}>
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

            <Grid2 container spacing={1} px={2} mb={10} flexDirection={'column'} overflow="auto">
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
        </Box>
    );
}

export default BallonDeOroResults;
