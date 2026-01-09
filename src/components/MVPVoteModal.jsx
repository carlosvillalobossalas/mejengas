import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useState } from "react";
import { getPlayerDisplay } from "../utils/playersDisplayName";

const MVPVoteModal = ({ open, onClose, match, allPlayers, onVote }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async () => {
    if (!selectedPlayerId) return;
    
    setIsSubmitting(true);
    try {
      await onVote(selectedPlayerId);
      onClose();
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedPlayerId("");
      onClose();
    }
  };

  if (!match) return null;

  // Combinar jugadores de ambos equipos
  const allMatchPlayers = [...(match.players1 || []), ...(match.players2 || [])];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: "90vh",
        }
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1, pt: 2, px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
          <EmojiEventsIcon sx={{ color: "warning.main", fontSize: { xs: "1.5rem", sm: "2rem" } }} />
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            Votar MVP
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
          Selecciona al mejor jugador
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 2, pt: 2 }}>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel id="mvp-select-label">Jugador MVP</InputLabel>
          <Select
            labelId="mvp-select-label"
            value={selectedPlayerId}
            label="Jugador MVP"
            onChange={(e) => setSelectedPlayerId(e.target.value)}
          >
            {allMatchPlayers.map((player) => {
              const playerInfo = allPlayers.find((p) => p.id === player.id);
              const playerName = getPlayerDisplay(playerInfo);
              const playerPhoto = playerInfo?.photoURL;

              return (
                <MenuItem key={player.id} value={player.id} sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                    <Avatar
                      src={playerPhoto}
                      sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.875rem" }}
                    >
                      {!playerPhoto && playerName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight="medium" sx={{ fontSize: "0.875rem" }}>
                        {playerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                        {player.position || (player.isGK ? "POR" : "---")}
                        {player.goals > 0 && ` • ${player.goals}⚽`}
                        {player.assists > 0 && ` • ${player.assists}👟`}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {selectedPlayerId && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "warning.50",
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "warning.main",
            }}
          >
            <Typography variant="caption" color="warning.dark" textAlign="center" display="block" sx={{ fontSize: "0.7rem" }}>
              <strong>⚠️ Importante:</strong> No podrás cambiar tu voto
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
          variant="outlined"
          fullWidth
          sx={{ order: { xs: 2, sm: 1 } }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleVote}
          disabled={!selectedPlayerId || isSubmitting}
          variant="contained"
          startIcon={<EmojiEventsIcon />}
          fullWidth
          sx={{ order: { xs: 1, sm: 2 } }}
        >
          {isSubmitting ? "Votando..." : "Confirmar Voto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MVPVoteModal;
