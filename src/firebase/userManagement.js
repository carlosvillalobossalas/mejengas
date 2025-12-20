import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Crea o actualiza un documento de usuario en Firestore
 * Llamar esto después del registro/login
 */
export const createOrUpdateUser = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Crear nuevo usuario
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      role: "user", // Por defecto es usuario normal
      playerId: null, // Sin enlazar inicialmente
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Actualizar datos básicos si cambiaron
    const userData = userDoc.data();
    const updates = {
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, updates, { merge: true });

    // Si el usuario está enlazado a un jugador y el displayName cambió, actualizar el jugador
    if (userData.playerId && user.displayName && userData.displayName !== user.displayName) {
      await syncDisplayNameToPlayer(user.uid, userData.playerId, user.displayName);
    }
  }
};

/**
 * Sincroniza el displayName del usuario con el nombre del jugador enlazado
 */
export const syncDisplayNameToPlayer = async (userId, playerId, displayName) => {
  if (!playerId || !displayName) return;

  try {
    const playerRef = doc(db, "Players", playerId);
    await updateDoc(playerRef, {
      name: displayName,
    });
  } catch (error) {
    console.error("Error syncing displayName to player:", error);
  }
};

/**
 * Obtiene los datos del usuario desde Firestore
 */
export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};
