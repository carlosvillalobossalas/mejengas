export const getPlayerDisplay = (player) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player?.name);
  if (!isEmail && player?.name) {
    return player.name;
  }
  return player?.originalName || player?.name || 'Sin nombre';
};

export const getPlayerShortDisplay = (player) => {
  const displayName = getPlayerDisplay(player);
  const names = displayName.split(' ');
  if (names.length === 1) {
    return names[0];
  }
  return `${names[0]} ${names[1][0]}`;
}