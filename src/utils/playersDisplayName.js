export const getPlayerDisplay = (player) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player?.name);
    if (!isEmail && player?.name) {
      return player.name;
    }
    return player?.originalName || player?.name || 'Sin nombre';
  };