/**
 * SCRIPT TEMPORAL PARA HACER ADMIN AL PRIMER USUARIO
 * 
 * INSTRUCCIONES:
 * 1. Regístrate o inicia sesión en la app
 * 2. Abre la consola del navegador (F12)
 * 3. Copia y pega este código completo
 * 4. Cambia TU_EMAIL por tu correo
 * 5. Presiona Enter
 * 6. Recarga la página
 * 7. Ya serás admin!
 */

import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

async function makeFirstUserAdmin() {
  try {
    const email = "TU_EMAIL_AQUI@gmail.com"; // CAMBIA ESTO
    
    // Buscar usuario por email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error("❌ Usuario no encontrado. Asegúrate de estar registrado primero.");
      return;
    }
    
    const userId = snapshot.docs[0].id;
    
    // Hacer admin
    await setDoc(doc(db, "users", userId), {
      role: "admin"
    }, { merge: true });
    
    console.log("✅ ¡Ahora eres admin! Recarga la página.");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Ejecutar
makeFirstUserAdmin();
