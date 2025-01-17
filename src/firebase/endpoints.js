import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const addNewPlayer = async (name) => {
  try {
    const playerCollectionRef = collection(db, "Players");
    await addDoc(playerCollectionRef, { name, goals: 0, assists: 0 });
    return true;
  } catch (error) {
    return false;
  }
};

export const getAllPlayers = async () => {
  try {
    const playerCollectionRef = collection(db, "Players");
    const snapshot = await getDocs(playerCollectionRef);
    return  snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });
  } catch (error) {
    return [];
  }
};
