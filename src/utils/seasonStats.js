/**
 * Calcula todas las estadísticas de una temporada basado en los partidos
 * @param {Array} matches - Array de partidos de la temporada
 * @returns {Object} Objeto con todas las estadísticas calculadas
 */
export const calculateSeasonStats = (matches) => {
  if (!matches || matches.length === 0) {
    return null;
  }

  // Objeto para acumular estadísticas por jugador
  const playerStats = {};
  const gkStats = {};

  // Procesar cada partido
  matches.forEach((match) => {
    const allPlayers = [...match.players1, ...match.players2];
    
    allPlayers.forEach((player) => {
      if (player.isGK) {
        // Estadísticas de porteros
        if (!gkStats[player.id]) {
          gkStats[player.id] = {
            id: player.id,
            name: player.name,
            matches: 0,
            goalsReceived: 0,
            cleanSheets: 0,
            won: 0,
            draw: 0,
            lost: 0,
          };
        }
      } else {
        // Estadísticas de jugadores de campo
        if (!playerStats[player.id]) {
          playerStats[player.id] = {
            id: player.id,
            name: player.name,
            matches: 0,
            goals: 0,
            assists: 0,
            won: 0,
            draw: 0,
            lost: 0,
          };
        }
        
        playerStats[player.id].matches += 1;
        playerStats[player.id].goals += player.goals || 0;
        playerStats[player.id].assists += player.assists || 0;
      }
    });

    // Determinar ganadores y perdedores
    const team1Won = match.goalsTeam1 > match.goalsTeam2;
    const team2Won = match.goalsTeam2 > match.goalsTeam1;
    const isDraw = match.goalsTeam1 === match.goalsTeam2;

    // Actualizar victorias/derrotas/empates
    match.players1.forEach((player) => {
      const stats = player.isGK ? gkStats[player.id] : playerStats[player.id];
      if (stats) {
        if (player.isGK) {
          stats.matches += 1;
          stats.goalsReceived += match.goalsTeam2 || 0;
          if (match.goalsTeam2 === 0) stats.cleanSheets += 1;
        }
        
        if (team1Won) stats.won += 1;
        else if (isDraw) stats.draw += 1;
        else stats.lost += 1;
      }
    });

    match.players2.forEach((player) => {
      const stats = player.isGK ? gkStats[player.id] : playerStats[player.id];
      if (stats) {
        if (player.isGK) {
          stats.matches += 1;
          stats.goalsReceived += match.goalsTeam1 || 0;
          if (match.goalsTeam1 === 0) stats.cleanSheets += 1;
        }
        
        if (team2Won) stats.won += 1;
        else if (isDraw) stats.draw += 1;
        else stats.lost += 1;
      }
    });
  });

  // Convertir objetos a arrays
  const playersArray = Object.values(playerStats);
  const gkArray = Object.values(gkStats);

  // Calcular ratios y promedios
  playersArray.forEach((player) => {
    player.goalsPerMatch = player.matches > 0 ? (player.goals / player.matches).toFixed(2) : 0;
    player.assistsPerMatch = player.matches > 0 ? (player.assists / player.matches).toFixed(2) : 0;
    player.winRate = player.matches > 0 ? ((player.won / player.matches) * 100).toFixed(1) : 0;
  });

  gkArray.forEach((gk) => {
    gk.goalsReceivedPerMatch = gk.matches > 0 ? (gk.goalsReceived / gk.matches).toFixed(2) : 0;
    gk.cleanSheetRate = gk.matches > 0 ? ((gk.cleanSheets / gk.matches) * 100).toFixed(1) : 0;
    gk.winRate = gk.matches > 0 ? ((gk.won / gk.matches) * 100).toFixed(1) : 0;
  });

  // Encontrar los mejores en cada categoría
  const stats = {
    totalMatches: matches.length,
    totalGoals: matches.reduce((acc, m) => acc + m.goalsTeam1 + m.goalsTeam2, 0),
    
    // Goleadores
    topScorer: playersArray.reduce((max, p) => p.goals > (max?.goals || 0) ? p : max, null),
    topScorersList: playersArray
      .filter(p => p.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 5),
    
    // Mejor ratio de goles
    bestGoalsPerMatch: playersArray
      .filter(p => p.matches >= 3) // Mínimo 3 partidos
      .reduce((max, p) => parseFloat(p.goalsPerMatch) > parseFloat(max?.goalsPerMatch || 0) ? p : max, null),
    
    // Asistencias
    topAssister: playersArray.reduce((max, p) => p.assists > (max?.assists || 0) ? p : max, null),
    topAssistersList: playersArray
      .filter(p => p.assists > 0)
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 5),
    
    // Mejor ratio de asistencias
    bestAssistsPerMatch: playersArray
      .filter(p => p.matches >= 3)
      .reduce((max, p) => parseFloat(p.assistsPerMatch) > parseFloat(max?.assistsPerMatch || 0) ? p : max, null),
    
    // Partidos jugados
    mostGamesPlayed: playersArray.reduce((max, p) => p.matches > (max?.matches || 0) ? p : max, null),
    leastGamesPlayed: playersArray.reduce((min, p) => p.matches < (min?.matches || Infinity) ? p : min, null),
    
    // Victorias
    mostWins: playersArray
      .sort((a, b) => b.won - a.won)
      .slice(0, 5),
    bestWinRate: playersArray
      .filter(p => p.matches >= 3)
      .reduce((max, p) => parseFloat(p.winRate) > parseFloat(max?.winRate || 0) ? p : max, null),
    
    // Porteros - más goles recibidos
    gkMostGoalsReceived: gkArray.reduce((max, gk) => gk.goalsReceived > (max?.goalsReceived || 0) ? gk : max, null),
    
    // Porteros - menos goles recibidos
    gkLeastGoalsReceived: gkArray.reduce((min, gk) => gk.goalsReceived < (min?.goalsReceived || Infinity) ? gk : min, null),
    
    // Porteros - mejor promedio de goles recibidos
    gkBestAverage: gkArray
      .filter(gk => gk.matches >= 3)
      .reduce((min, gk) => parseFloat(gk.goalsReceivedPerMatch) < parseFloat(min?.goalsReceivedPerMatch || Infinity) ? gk : min, null),
    
    // Porteros - más vallas invictas
    gkMostCleanSheets: gkArray.reduce((max, gk) => gk.cleanSheets > (max?.cleanSheets || 0) ? gk : max, null),
    gkBestCleanSheetRate: gkArray
      .filter(gk => gk.matches >= 3)
      .reduce((max, gk) => parseFloat(gk.cleanSheetRate) > parseFloat(max?.cleanSheetRate || 0) ? gk : max, null),
    
    // Datos completos para la página
    allPlayerStats: playersArray.sort((a, b) => b.goals - a.goals),
    allGKStats: gkArray.sort((a, b) => parseFloat(a.goalsReceivedPerMatch) - parseFloat(b.goalsReceivedPerMatch)),
  };

  return stats;
};

/**
 * Obtiene el año de un partido
 */
export const getMatchYear = (match) => {
  const date = match.date.toDate ? match.date.toDate() : match.date;
  return date.getFullYear();
};

/**
 * Filtra partidos por año
 */
export const filterMatchesByYear = (matches, year) => {
  return matches.filter(match => getMatchYear(match) === year);
};
