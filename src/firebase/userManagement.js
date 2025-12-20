import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
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
    await setDoc(
      userRef,
      {
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
};

/**
 * Obtiene los datos del usuario desde Firestore
 */
export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};
