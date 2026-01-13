import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// ==================== CRUD DE JUGADORES ====================

// Agregar un nuevo jugador
export const addNewPlayer = async (name, groupId = "HpWjsA6l5WjJ7FNlC8uA") => {
  try {
    const playerCollectionRef = collection(db, "Players");
    await addDoc(playerCollectionRef, {
      name,
      originalName: name,
      groupId,
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Obtener todos los jugadores con listener en tiempo real
export const getAllPlayers = async (callback, groupId = "HpWjsA6l5WjJ7FNlC8uA") => {
  try {
    const playerCollectionRef = collection(db, "Players");
    const q = query(playerCollectionRef, where("groupId", "==", groupId));

    // Configura el listener y ejecuta el callback con los datos actualizados
    const unsubscribe = onSnapshot(q, (snapshot) => {
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

// Obtener todos los jugadores sin listener (para operaciones únicas)
export const getAllPlayersOnce = async (groupId = "HpWjsA6l5WjJ7FNlC8uA") => {
  try {
    const playerCollectionRef = collection(db, "Players");
    const q = query(playerCollectionRef, where("groupId", "==", groupId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error getting all players:", error);
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

// Enlazar usuario a jugador
export const linkUserToPlayer = async (userId, playerId, userDisplayName, userPhotoURL, userEmail) => {
  try {
    // Obtener el jugador para guardar su nombre original
    const playerDoc = await getDoc(doc(db, "Players", playerId));
    const playerData = playerDoc.data();

    // Actualizar documento de usuario
    await updateDoc(doc(db, "users", userId), {
      playerId: playerId,
      updatedAt: new Date(),
    });

    // Actualizar documento de jugador - solo campos permitidos
    const playerUpdates = {
      userId: userId,
      name: userDisplayName || userEmail,
      updatedAt: new Date(),
    };

    // Guardar la foto de perfil si viene de Google u otro proveedor
    if (userPhotoURL) {
      playerUpdates.photoURL = userPhotoURL;
    }

    // Guardar el nombre original solo si no existe ya (para poder restaurarlo al desenlazar)
    if (!playerData.originalName) {
      playerUpdates.originalName = playerData.name;
    }

    await updateDoc(doc(db, "Players", playerId), playerUpdates);

    return { success: true };
  } catch (error) {
    console.error("Error linking user to player:", error);
    throw new Error(error);
  }
};

// Desenlazar usuario de jugador
export const unlinkUserFromPlayer = async (userId, playerId) => {
  try {
    // Obtener el nombre actual del jugador antes de desenlazar
    const playerDoc = await getDoc(doc(db, "Players", playerId));
    const playerData = playerDoc.data();

    // Actualizar documento de usuario
    await updateDoc(doc(db, "users", userId), {
      playerId: null,
      updatedAt: new Date(),
    });

    // Actualizar documento de jugador - mantener solo campos permitidos
    const playerUpdates = {
      userId: null,
      updatedAt: new Date(),
    };

    // Si existe originalName, restaurarlo
    if (playerData.originalName) {
      playerUpdates.name = playerData.originalName;
    }

    // Remover photoURL si existía
    if (playerData.photoURL) {
      playerUpdates.photoURL = null;
    }

    await updateDoc(doc(db, "Players", playerId), playerUpdates);

    return { success: true };
  } catch (error) {
    console.error("Error unlinking user from player:", error);
    throw new Error(error);
  }
};

// ==================== PREMIOS Y AWARDS ====================

// Actualizar awards del jugador después de ganar Balón de Oro
export const updatePlayerAwards = async (playerId, awardData) => {
  try {
    const playerRef = doc(db, "Players", playerId);
    const playerDoc = await getDoc(playerRef);
    
    if (playerDoc.exists()) {
      const currentAwards = playerDoc.data().awards || [];
      await updateDoc(playerRef, {
        awards: [
          ...currentAwards,
          awardData,
        ],
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating player awards:", error);
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

// ==================== ESTADÍSTICAS DE TEMPORADA ====================

// Obtener o crear estadísticas de temporada para un jugador
export const getPlayerSeasonStats = async (playerId, season, groupId = "HpWjsA6l5WjJ7FNlC8uA") => {
  try {
    const statsRef = doc(db, "PlayerSeasonStats", `${playerId}_${season}_${groupId}`);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return { id: statsDoc.id, ...statsDoc.data() };
    }
    
    // Si no existe, crear documento inicial
    const initialStats = {
      playerId,
      season,
      groupId,
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
    return { id: `${playerId}_${season}_${groupId}`, ...initialStats };
  } catch (error) {
    console.error("Error getting player season stats:", error);
    throw new Error(error);
  }
};

// Obtener todas las estadísticas de temporadas de un jugador
export const getAllPlayerSeasonStats = async (playerId, groupId = "HpWjsA6l5WjJ7FNlC8uA") => {
  try {
    const statsRef = collection(db, "PlayerSeasonStats");
    const q = query(
      statsRef, 
      where("playerId", "==", playerId),
      where("groupId", "==", groupId)
    );
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
export const getAllPlayersSeasonStats = async (groupId = "HpWjsA6l5WjJ7FNlC8uA") => {
  try {
    const statsRef = collection(db, "PlayerSeasonStats");
    const q = query(statsRef, where("groupId", "==", groupId));
    const snapshot = await getDocs(q);
    
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

// Actualizar estadísticas de temporada después de un partido
export const updatePlayerSeasonStatsAfterMatch = async (matchData, groupId = "HpWjsA6l5WjJ7FNlC8uA") => {
  try {
    console.log(matchData)
    const matchYear = matchData.date.getFullYear();
    const allPlayers = [...matchData.players1, ...matchData.players2];
    const team1Won = matchData.goalsTeam1 > matchData.goalsTeam2;
    const isDraw = matchData.goalsTeam1 === matchData.goalsTeam2;
    
    for (let i = 0; i < allPlayers.length; i++) {
      const player = allPlayers[i];
      const isTeam1 = i < matchData.players1.length;
      const statsRef = doc(db, "PlayerSeasonStats", `${player.id}_${matchYear}_${groupId}`);
      
      const statsDoc = await getDoc(statsRef);
      const currentStats = statsDoc.exists() ? statsDoc.data() : {
        playerId: player.id,
        season: matchYear,
        groupId,
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
    }

    return true;
  } catch (error) {
    console.error("Error updating player season stats:", error);
    throw new Error(error);
  }
};
