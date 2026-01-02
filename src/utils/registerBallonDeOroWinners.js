/**
 * Script para registrar manualmente los ganadores del Balón de Oro
 * Ejecutar este script después de determinar los ganadores
 */

import { saveBallonDeOroWinners } from "./firebase/endpoints";

/**
 * Registra los ganadores del Balón de Oro para un año específico
 * @param {number} year - Año del premio
 * @param {string} firstPlaceId - ID del jugador en primer lugar (Balón de Oro)
 * @param {string} secondPlaceId - ID del jugador en segundo lugar (Balón de Plata)
 * @param {string} thirdPlaceId - ID del jugador en tercer lugar (Balón de Bronce)
 */
export const registerBallonDeOroWinners = async (
  year,
  firstPlaceId,
  secondPlaceId,
  thirdPlaceId
) => {
  try {
    console.log(`Registrando ganadores del Balón de Oro ${year}...`);
    
    await saveBallonDeOroWinners(year, firstPlaceId, secondPlaceId, thirdPlaceId);
    
    console.log("✅ Ganadores registrados exitosamente:");
    console.log(`🥇 Balón de Oro: ${firstPlaceId}`);
    console.log(`🥈 Balón de Plata: ${secondPlaceId}`);
    console.log(`🥉 Balón de Bronce: ${thirdPlaceId}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error al registrar ganadores:", error);
    throw error;
  }
};

/**
 * Ejemplo de uso:
 * 
 * import { registerBallonDeOroWinners } from './registerBallonDeOroWinners';
 * 
 * // Obtener los IDs desde los resultados de la votación
 * const results = await getBallonDeOroResults(2025);
 * const ranking = createRanking(results.playerPoints);
 * 
 * // Registrar los 3 primeros lugares
 * await registerBallonDeOroWinners(
 *   2025,
 *   ranking[0].playerId, // Primer lugar
 *   ranking[1].playerId, // Segundo lugar
 *   ranking[2].playerId  // Tercer lugar
 * );
 */

// Función auxiliar para crear el ranking desde los resultados
export const createRanking = (playerPoints) =>
  Object.entries(playerPoints)
    .map(([playerId, points]) => ({
      playerId,
      points,
    }))
    .sort((a, b) => b.points - a.points);
