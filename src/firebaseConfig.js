import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdryuySWKcLNqN1G_LWkpYWeqQMN2pbBw",
  authDomain: "mejengas-a7794.firebaseapp.com",
  projectId: "mejengas-a7794",
  storageBucket: "mejengas-a7794.firebasestorage.app",
  messagingSenderId: "323022168038",
  appId: "1:323022168038:web:d2cd7adde915021d62c027",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { db, auth };
