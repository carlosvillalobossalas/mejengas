import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const addNewPlayer = async (name) => {
  try {
    const playerCollectionRef = collection(db, "Players");
    await addDoc(playerCollectionRef, { name, goals: 0, assists: 0 });
    return true;
  } catch (error) {
    console.log("🚀 ~ addNewPlayer ~ error:", error);
    return false;
  }
};
