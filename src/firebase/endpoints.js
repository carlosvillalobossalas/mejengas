import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { calculateSeasonStats, filterMatchesByYear, getMatchYear } from "../utils/seasonStats";

export const addNewPlayer = async (name) => {
  try {
    const playerCollectionRef = collection(db, "Players");
    await addDoc(playerCollectionRef, {
      name,
      goals: 0,
      assists: 0,
      won: 0,
      matches: 0,
      draw: 0,
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const getAllPlayers = async (callback) => {
  try {
    const playerCollectionRef = collection(db, "Players");

    // Configura el listener y ejecuta el callback con los datos actualizados
    const unsubscribe = onSnapshot(playerCollectionRef, (snapshot) => {
      const players = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(players.sort((a, b) => a.name.localeCompare(b.name))); // Llama al callback con la lista actualizada de jugadores
    });

    // Devuelve la función para cancelar la suscripción
    return unsubscribe;
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllGKs = async (callback) => {
  try {
    const gkCollectionRef = collection(db, "Goalkeepers");

    // Configura el listener y ejecuta el callback con los datos actualizados
    const unsubscribe = onSnapshot(gkCollectionRef, (snapshot) => {
      const gks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(gks); // Llama al callback con la lista actualizada de jugadores
    });

    // Devuelve la función para cancelar la suscripción
    return unsubscribe;
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllMatches = async (callback) => {
  try {
    const matchCollectionRef = collection(db, "Matches");

    // Crea una consulta que ordena los documentos por fecha en orden descendente
    const matchesQuery = query(matchCollectionRef, orderBy("date", "desc"));

    // Configura el listener y ejecuta el callback con los datos actualizados
    const unsubscribe = onSnapshot(matchesQuery, (snapshot) => {
      const matches = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(matches); // Llama al callback con la lista actualizada de jugadores
    });
    // Devuelve la función para cancelar la suscripción
    return unsubscribe;
  } catch (error) {
    throw new Error(error);
  }
};

export const saveNewMatch = async (data, players) => {
  try {
    //new match save
    const match = {
      ...data,
      date: data.date.toDate(),
      goalsTeam1: data.players1.reduce((acc, value) => {
        if (value.goals === "") return acc;

        return parseInt(acc ?? 0) + parseInt(value?.goals ?? 0);
      }, 0),
      goalsTeam2:
        data.players2.reduce((acc, value) => {
          if (value.goals === "") return acc;

          return parseInt(acc ?? 0) + parseInt(value?.goals ?? 0);
        }, 0) ?? 0,
    };
    const matchCollectionRef = collection(db, "Matches");
    await addDoc(matchCollectionRef, match);

    //update gks
    const gk1 = data.players1.find((p) => p.isGK);
    const playerGK1 = players.find((p) => p.id === gk1.id);
    const gk1DocRef = doc(db, "Goalkeepers", gk1.id);
    const gk1Doc = await getDoc(gk1DocRef);
    let gk1Data = gk1Doc.data();
    if (gk1Data === undefined) {
      gk1Data = { ...gk1, cleanSheet: 0, matches: 0, won: 0 };
    }
    const gk1CleanSheet = match.goalsTeam2 === 0;

    await setDoc(
      gk1DocRef,
      {
        ...playerGK1,
        ...gk1Data,
        cleanSheet: gk1Data.cleanSheet + (gk1CleanSheet ? 1 : 0),
        matches: gk1Data.matches + 1,
        goals: gk1Data.goals + match.goalsTeam2,
        won:
          (gk1Data?.won ?? 0) + (match.goalsTeam1 > match.goalsTeam2 ? 1 : 0),
        draw:
          (gk1Data?.draw ?? 0) +
          (match.goalsTeam1 === match.goalsTeam2 ? 1 : 0),
      },
      { merge: true }
    );

    const gk2 = data.players2.find((p) => p.isGK);
    const playerGK2 = players.find((p) => p.id === gk1.id);

    const gk2DocRef = doc(db, "Goalkeepers", gk2.id);
    const gk2Doc = await getDoc(gk2DocRef);
    let gk2Data = gk2Doc.data();
    if (gk2Data === undefined) {
      gk2Data = { ...gk2, cleanSheet: 0, matches: 0 };
    }
    const gk2CleanSheet = match.goalsTeam1 === 0;

    await setDoc(
      gk2DocRef,
      {
        ...playerGK2,
        ...gk2Data,
        cleanSheet: gk2Data.cleanSheet + (gk2CleanSheet ? 1 : 0),
        matches: gk2Data.matches + 1,
        goals: gk2Data.goals + match.goalsTeam1,
        won:
          (gk2Data?.won ?? 0) + (match.goalsTeam2 > match.goalsTeam1 ? 1 : 0),
        draw:
          (gk1Data?.draw ?? 0) +
          (match.goalsTeam1 === match.goalsTeam2 ? 1 : 0),
      },
      { merge: true }
    );

    //update players - solo actualizar info básica, NO estadísticas
    const players1Promises = data.players1.map((player) => {
      const playerDocRef = doc(db, "Players", player.id);
      return updateDoc(playerDocRef, {
        name: player.name,
        photoURL: player.photoURL,
      });
    });

    await Promise.all(players1Promises);

    const players2Promises = data.players2.map((player) => {
      const playerDocRef = doc(db, "Players", player.id);
      return updateDoc(playerDocRef, {
        name: player.name,
        photoURL: player.photoURL,
      });
    });

    await Promise.all(players2Promises);

    // Actualizar estadísticas por temporada (nuevo sistema)
    await updatePlayerSeasonStatsAfterMatch(match);

    // Recalcular y actualizar el resumen de la temporada
    const matchYear = getMatchYear(match);
    await updateSeasonSummary(matchYear);
  } catch (error) {
    throw new Error(error);
  }
};

// Obtener resumen de una temporada específica
export const getSeasonSummary = async (year, callback) => {
  try {
    const summaryDocRef = doc(db, "Resumenes", year.toString());
    
    const unsubscribe = onSnapshot(summaryDocRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error en getSeasonSummary:", error);
    callback(null);
    return () => {}; // Retornar función vacía en caso de error
  }
};

// Obtener todos los resúmenes disponibles
export const getAllSeasonSummaries = async (callback) => {
  try {
    const summariesCollectionRef = collection(db, "Resumenes");
    
    const unsubscribe = onSnapshot(summariesCollectionRef, (snapshot) => {
      const summaries = snapshot.docs.map((doc) => ({
        year: doc.id,
        ...doc.data(),
      }));
      callback(summaries.sort((a, b) => b.year - a.year));
    });

    return unsubscribe;
  } catch (error) {
    console.error("Error en getAllSeasonSummaries:", error);
    callback([]);
    return () => {}; // Retornar función vacía en caso de error
  }
};

// Actualizar el resumen de una temporada específica
export const updateSeasonSummary = async (year) => {
  try {
    // Obtener todos los partidos del año
    const matchCollectionRef = collection(db, "Matches");
    const matchesSnapshot = await getDocs(matchCollectionRef);
    const allMatches = matchesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filtrar partidos por año
    const yearMatches = filterMatchesByYear(allMatches, year);

    if (yearMatches.length === 0) {
      console.log(`No hay partidos para el año ${year}`);
      return;
    }

    // Calcular estadísticas
    const stats = calculateSeasonStats(yearMatches);

    if (!stats) {
      console.log(`No se pudieron calcular estadísticas para ${year}`);
      return;
    }

    // Guardar en la colección Resumenes
    const summaryDocRef = doc(db, "Resumenes", year.toString());
    await setDoc(summaryDocRef, {
      year: year,
      lastUpdated: new Date(),
      ...stats,
    });

    console.log(`Resumen de temporada ${year} actualizado correctamente`);
  } catch (error) {
    console.error("Error actualizando resumen de temporada:", error);
    throw new Error(error);
  }
};

// Recalcular todos los resúmenes de temporadas
export const recalculateAllSeasonSummaries = async () => {
  try {
    // Obtener todos los partidos
    const matchCollectionRef = collection(db, "Matches");
    const matchesSnapshot = await getDocs(matchCollectionRef);
    const allMatches = matchesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Agrupar partidos por año
    const matchesByYear = {};
    allMatches.forEach((match) => {
      const year = getMatchYear(match);
      if (!matchesByYear[year]) {
        matchesByYear[year] = [];
      }
      matchesByYear[year].push(match);
    });

    // Recalcular cada año
    const promises = Object.keys(matchesByYear).map((year) => 
      updateSeasonSummary(parseInt(year))
    );

    await Promise.all(promises);
    console.log("Todos los resúmenes de temporada han sido recalculados");
  } catch (error) {
    console.error("Error recalculando resúmenes:", error);
    throw new Error(error);
  }
};

// Guardar votos del Balón de Oro
export const saveBallonDeOroVotes = async (userId, votes) => {
  try {
    const year = new Date().getFullYear();
    const voteData = {
      userId,
      year,
      primero: votes.primero,
      segundo: votes.segundo,
      tercero: votes.tercero,
      cuarto: votes.cuarto,
      quinto: votes.quinto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Verificar si el usuario ya votó este año
    const votesRef = collection(db, "BallonDeOroVotes");
    const q = query(votesRef, where("userId", "==", userId), where("year", "==", year));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Actualizar voto existente
      const voteId = snapshot.docs[0].id;
      await updateDoc(doc(db, "BallonDeOroVotes", voteId), voteData);
      return { success: true, message: "Voto actualizado correctamente", isUpdate: true };
    } else {
      // Crear nuevo voto
      await addDoc(votesRef, voteData);
      return { success: true, message: "Voto guardado correctamente", isUpdate: false };
    }
  } catch (error) {
    console.error("Error guardando votos:", error);
    throw new Error(error);
  }
};

// Verificar si el usuario ya votó este año
export const checkIfUserVoted = async (userId) => {
  try {
    const year = new Date().getFullYear();
    const votesRef = collection(db, "BallonDeOroVotes");
    const q = query(votesRef, where("userId", "==", userId), where("year", "==", year));
    const snapshot = await getDocs(q);
    
    return {
      hasVoted: !snapshot.empty,
      vote: snapshot.empty ? null : snapshot.docs[0].data(),
    };
  } catch (error) {
    console.error("Error verificando voto:", error);
    throw new Error(error);
  }
};

// Obtener todos los votos del año actual y calcular resultados con sistema de puntos
export const getBallonDeOroResults = async (year) => {
  try {
    const votesRef = collection(db, "BallonDeOroVotes");
    const q = query(votesRef, where("year", "==", year));
    const snapshot = await getDocs(q);

    // Sistema de puntuación: Primero = 6, Segundo = 4, Tercero = 3, Cuarto = 2, Quinto = 1
    const pointsSystem = {
      primero: 6,
      segundo: 4,
      tercero: 3,
      cuarto: 2,
      quinto: 1,
    };

    const playerPoints = {};
    const allVotes = snapshot.docs.map((doc) => doc.data());

    allVotes.forEach((vote) => {
      // Sumar puntos por primero (6 puntos)
      if (vote.primero) {
        playerPoints[vote.primero] = (playerPoints[vote.primero] || 0) + pointsSystem.primero;
      }
      // Sumar puntos por segundo (4 puntos)
      if (vote.segundo) {
        playerPoints[vote.segundo] = (playerPoints[vote.segundo] || 0) + pointsSystem.segundo;
      }
      // Sumar puntos por tercero (3 puntos)
      if (vote.tercero) {
        playerPoints[vote.tercero] = (playerPoints[vote.tercero] || 0) + pointsSystem.tercero;
      }
      // Sumar puntos por cuarto (2 puntos)
      if (vote.cuarto) {
        playerPoints[vote.cuarto] = (playerPoints[vote.cuarto] || 0) + pointsSystem.cuarto;
      }
      // Sumar puntos por quinto (1 punto)
      if (vote.quinto) {
        playerPoints[vote.quinto] = (playerPoints[vote.quinto] || 0) + pointsSystem.quinto;
      }
    });

    return {
      totalVotes: allVotes.length,
      playerPoints,
      votes: allVotes,
    };
  } catch (error) {
    console.error("Error obteniendo resultados:", error);
    throw new Error(error);
  }
};

// Obtener jugador por userId
export const getPlayerByUserId = async (userId) => {
  try {
    const playersRef = collection(db, "Players");
    const q = query(playersRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting player by userId:", error);
    throw new Error(error);
  }
};

// Obtener jugador por ID
export const getPlayerById = async (playerId) => {
  try {
    const playerRef = doc(db, "Players", playerId);
    const playerDoc = await getDoc(playerRef);
    
    if (playerDoc.exists()) {
      return {
        id: playerDoc.id,
        ...playerDoc.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting player by ID:", error);
    throw new Error(error);
  }
};

// Actualizar perfil del jugador
export const updatePlayerProfile = async (playerId, updates) => {
  try {
    const playerRef = doc(db, "Players", playerId);
    await updateDoc(playerRef, {
      ...updates,
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error updating player profile:", error);
    throw new Error(error);
  }
};

// ==================== SISTEMA DE PREMIOS Y ESTADÍSTICAS ====================

// Guardar ganadores del Balón de Oro
export const saveBallonDeOroWinners = async (year, first, second, third) => {
  try {
    const winnersRef = doc(db, "BallonDeOroWinners", year.toString());
    await setDoc(winnersRef, {
      year,
      first,
      second,
      third,
      createdAt: new Date(),
    });

    // Actualizar awards en los perfiles de los jugadores ganadores
    const awards = [
      { playerId: first, position: 1, award: "Balón de Oro" },
      { playerId: second, position: 2, award: "Balón de Plata" },
      { playerId: third, position: 3, award: "Balón de Bronce" },
    ];

    for (const { playerId, position, award } of awards) {
      if (playerId) {
        const playerRef = doc(db, "Players", playerId);
        const playerDoc = await getDoc(playerRef);
        
        if (playerDoc.exists()) {
          const currentAwards = playerDoc.data().awards || [];
          await updateDoc(playerRef, {
            awards: [
              ...currentAwards,
              { type: "ballonDeOro", position, award, year },
            ],
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error saving Ballon de Oro winners:", error);
    throw new Error(error);
  }
};

// Obtener ganadores del Balón de Oro por año
export const getBallonDeOroWinners = async (year) => {
  try {
    const winnersRef = doc(db, "BallonDeOroWinners", year.toString());
    const winnersDoc = await getDoc(winnersRef);
    
    if (winnersDoc.exists()) {
      return winnersDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting Ballon de Oro winners:", error);
    throw new Error(error);
  }
};

// Obtener todos los premios de un jugador
export const getPlayerAwards = async (playerId) => {
  try {
    const playerRef = doc(db, "Players", playerId);
    const playerDoc = await getDoc(playerRef);
    
    if (playerDoc.exists()) {
      return playerDoc.data().awards || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting player awards:", error);
    throw new Error(error);
  }
};

// Obtener o crear estadísticas de temporada para un jugador
export const getPlayerSeasonStats = async (playerId, season) => {
  try {
    const statsRef = doc(db, "PlayerSeasonStats", `${playerId}_${season}`);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return { id: statsDoc.id, ...statsDoc.data() };
    }
    
    // Si no existe, crear documento inicial
    const initialStats = {
      playerId,
      season,
      goals: 0,
      assists: 0,
      matches: 0,
      won: 0,
      draw: 0,
      lost: 0,
      cleanSheets: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(statsRef, initialStats);
    return { id: `${playerId}_${season}`, ...initialStats };
  } catch (error) {
    console.error("Error getting player season stats:", error);
    throw new Error(error);
  }
};

// Actualizar estadísticas de temporada después de un partido
export const updatePlayerSeasonStatsAfterMatch = async (matchData) => {
  try {
    const matchYear = matchData.date.toDate().getFullYear();
    const allPlayers = [...matchData.players1, ...matchData.players2];
    const team1Won = matchData.goalsTeam1 > matchData.goalsTeam2;
    const isDraw = matchData.goalsTeam1 === matchData.goalsTeam2;
    
    for (let i = 0; i < allPlayers.length; i++) {
      const player = allPlayers[i];
      const isTeam1 = i < matchData.players1.length;
      const statsRef = doc(db, "PlayerSeasonStats", `${player.id}_${matchYear}`);
      
      const statsDoc = await getDoc(statsRef);
      const currentStats = statsDoc.exists() ? statsDoc.data() : {
        playerId: player.id,
        season: matchYear,
        goals: 0,
        assists: 0,
        matches: 0,
        won: 0,
        draw: 0,
        lost: 0,
        cleanSheets: 0,
        createdAt: new Date(),
      };

      // Determinar resultado del partido para este jugador
      let won = 0, draw = 0, lost = 0;
      if (isDraw) {
        draw = 1;
      } else if ((isTeam1 && team1Won) || (!isTeam1 && !team1Won)) {
        won = 1;
      } else {
        lost = 1;
      }

      // Clean sheet para porteros
      let cleanSheets = 0;
      if (player.isGK) {
        if (isTeam1 && matchData.goalsTeam2 === 0) {
          cleanSheets = 1;
        } else if (!isTeam1 && matchData.goalsTeam1 === 0) {
          cleanSheets = 1;
        }
      }

      const updatedStats = {
        ...currentStats,
        goals: currentStats.goals + (player.goals || 0),
        assists: currentStats.assists + (player.assists || 0),
        matches: currentStats.matches + 1,
        won: currentStats.won + won,
        draw: currentStats.draw + draw,
        lost: currentStats.lost + lost,
        cleanSheets: currentStats.cleanSheets + cleanSheets,
        updatedAt: new Date(),
      };

      await setDoc(statsRef, updatedStats);

      // También actualizar los totales en la tabla Players
      const playerRef = doc(db, "Players", player.id);
      const playerDoc = await getDoc(playerRef);
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        await updateDoc(playerRef, {
          goals: (playerData.goals || 0) + (player.goals || 0),
          assists: (playerData.assists || 0) + (player.assists || 0),
          matches: (playerData.matches || 0) + 1,
          won: (playerData.won || 0) + won,
          draw: (playerData.draw || 0) + draw,
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error updating player season stats:", error);
    throw new Error(error);
  }
};

// Obtener todas las estadísticas de temporadas de un jugador
export const getAllPlayerSeasonStats = async (playerId) => {
  try {
    const statsRef = collection(db, "PlayerSeasonStats");
    const q = query(statsRef, where("playerId", "==", playerId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })).sort((a, b) => b.season - a.season);
  } catch (error) {
    console.error("Error getting all player season stats:", error);
    throw new Error(error);
  }
};

// Obtener todas las estadísticas de todos los jugadores agrupadas por temporada
export const getAllPlayersSeasonStats = async () => {
  try {
    const statsRef = collection(db, "PlayerSeasonStats");
    const snapshot = await getDocs(statsRef);
    
    const statsBySeason = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const season = data.season;
      
      if (!statsBySeason[season]) {
        statsBySeason[season] = [];
      }
      
      statsBySeason[season].push({
        id: data.playerId,
        ...data,
      });
    });
    
    return statsBySeason;
  } catch (error) {
    console.error("Error getting all players season stats:", error);
    throw new Error(error);
  }
};

// Migrar datos históricos de todos los partidos a PlayerSeasonStats
export const migrateHistoricalMatchesToSeasonStats = async () => {
  try {
    console.log("🔄 Iniciando migración de datos históricos...");
    
    // Obtener todos los partidos
    const matchesRef = collection(db, "Matches");
    const matchesSnapshot = await getDocs(matchesRef);
    
    const matches = matchesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`📊 Encontrados ${matches.length} partidos para procesar`);

    let processedCount = 0;
    let errorCount = 0;

    // Procesar cada partido
    for (const match of matches) {
      try {
        // Asegurarse de que el partido tenga fecha
        if (match.date) {
          await updatePlayerSeasonStatsAfterMatch(match);
          processedCount++;
          console.log(`✅ Partido ${match.id} procesado (${processedCount}/${matches.length})`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error procesando partido ${match.id}:`, error);
      }
    }

    console.log("✅ Migración completada:");
    console.log(`   - Partidos procesados: ${processedCount}`);
    console.log(`   - Errores: ${errorCount}`);

    return {
      success: true,
      processed: processedCount,
      errors: errorCount,
      total: matches.length
    };
  } catch (error) {
    console.error("❌ Error en la migración:", error);
    throw new Error(error);
  }
};
