export const formatMatchSummary = (match) => {
  const date = match.date.toDate().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = `⚽ *RESUMEN DEL PARTIDO* ⚽\n`;
  message += `📅 ${date}\n`;
  message += `🏆 Resultado: ${match.goalsTeam1} - ${match.goalsTeam2}\n\n`;

  // Equipo 1
  message += `*EQUIPO 1*\n`;
  match.players1.forEach((player) => {
    message += `• ${player.isGK ? '🧤 ' : ''}${player.name}`;
    if (!player.isGK && (player.goals > 0 || player.assists > 0)) {
      message += ' (';
      if (player.goals > 0) message += `⚽${player.goals}`;
      if (player.goals > 0 && player.assists > 0) message += ', ';
      if (player.assists > 0) message += `👟${player.assists}`;
      message += ')';
    }
    message += '\n';
  });

  message += `\n*EQUIPO 2*\n`;
  match.players2.forEach((player) => {
    message += `• ${player.isGK ? '🧤 ' : ''}${player.name}`;
    if (!player.isGK && (player.goals > 0 || player.assists > 0)) {
      message += ' (';
      if (player.goals > 0) message += `⚽${player.goals}`;
      if (player.goals > 0 && player.assists > 0) message += ', ';
      if (player.assists > 0) message += `👟${player.assists}`;
      message += ')';
    }
    message += '\n';
  });

  // Goles
  const allGoals = [
    ...match.players1.filter(p => !p.isGK && p.goals > 0).map(p => ({ ...p, team: 1 })),
    ...match.players2.filter(p => !p.isGK && p.goals > 0).map(p => ({ ...p, team: 2 }))
  ].sort((a, b) => b.goals - a.goals);

  if (allGoals.length > 0) {
    message += `\n*GOLEADORES* ⚽\n`;
    allGoals.forEach((player) => {
      message += `• ${player.name}: ${player.goals} gol${player.goals > 1 ? 'es' : ''}\n`;
    });
  }

  // Asistencias
  const allAssists = [
    ...match.players1.filter(p => !p.isGK && p.assists > 0).map(p => ({ ...p, team: 1 })),
    ...match.players2.filter(p => !p.isGK && p.assists > 0).map(p => ({ ...p, team: 2 }))
  ].sort((a, b) => b.assists - a.assists);

  if (allAssists.length > 0) {
    message += `\n*ASISTENCIAS* 👟\n`;
    allAssists.forEach((player) => {
      message += `• ${player.name}: ${player.assists} asistencia${player.assists > 1 ? 's' : ''}\n`;
    });
  }

  return message;
};

export const shareToWhatsApp = (message) => {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
};
