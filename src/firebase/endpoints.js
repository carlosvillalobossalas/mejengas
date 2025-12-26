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

    //update players
    const players1Promises = data.players1.map((player) => {
      const playerDocRef = doc(db, "Players", player.id);
      const oldPlayerRecord = players.find((p) => p.id === player.id);
      return updateDoc(playerDocRef, {
        ...player,
        won:
          oldPlayerRecord.won + (match.goalsTeam1 > match.goalsTeam2 ? 1 : 0),
        draw:
          oldPlayerRecord.draw +
          (match.goalsTeam1 === match.goalsTeam2 ? 1 : 0),
        goals: player.goals + oldPlayerRecord.goals,
        assists: player.assists + oldPlayerRecord.assists,
        matches: (oldPlayerRecord.matches ?? 0) + 1,
      });
    });

    await Promise.all(players1Promises);

    const players2Promises = data.players2.map((player) => {
      const playerDocRef = doc(db, "Players", player.id);
      const oldPlayerRecord = players.find((p) => p.id === player.id);
      return updateDoc(playerDocRef, {
        ...player,
        won:
          oldPlayerRecord.won + (match.goalsTeam2 > match.goalsTeam1 ? 1 : 0),
        goals: player.goals + oldPlayerRecord.goals,
        assists: player.assists + oldPlayerRecord.assists,
        matches: (oldPlayerRecord.matches ?? 0) + 1,
        draw:
          oldPlayerRecord.draw +
          (match.goalsTeam1 === match.goalsTeam2 ? 1 : 0),
      });
    });

    await Promise.all(players2Promises);

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
      oro: votes.oro,
      plata: votes.plata,
      bronce: votes.bronce,
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
