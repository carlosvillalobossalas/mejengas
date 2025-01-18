import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export const addNewPlayer = async (name) => {
  try {
    const playerCollectionRef = collection(db, "Players");
    await addDoc(playerCollectionRef, {
      name,
      goals: 0,
      assists: 0,
      won: 0,
      matches: 0,
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
      callback(players); // Llama al callback con la lista actualizada de jugadores
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
        ...gk1Data,
        cleanSheet: gk1Data.cleanSheet + (gk1CleanSheet ? 1 : 0),
        matches: gk1Data.matches + 1,
        goals: gk1Data.goals + match.goalsTeam2,
        won:
          (gk1Data?.won ?? 0) + (match.goalsTeam1 > match.goalsTeam2 ? 1 : 0),
      },
      { merge: true }
    );

    const gk2 = data.players2.find((p) => p.isGK);
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
        ...gk2Data,
        cleanSheet: gk2Data.cleanSheet + (gk2CleanSheet ? 1 : 0),
        matches: gk2Data.matches + 1,
        goals: gk2Data.goals + match.goalsTeam1,
        won:
          (gk2Data?.won ?? 0) + (match.goalsTeam2 > match.goalsTeam1 ? 1 : 0),
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
      });
    });

    await Promise.all(players2Promises);
  } catch (error) {
    throw new Error(error);
  }
};
