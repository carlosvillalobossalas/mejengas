import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "../firebaseConfig";
import { fetchUserData, setInitialized, setUser, setUserData } from "../store/slices/authSlice";

const AuthListener = () => {
  const dispatch = useDispatch();
  const initializedOnceRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          dispatch(
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            })
          );

          await dispatch(fetchUserData(firebaseUser.uid)).unwrap();
        } else {
          dispatch(setUser(null));
          dispatch(setUserData(null));
        }
      } catch (error) {
        console.error("Error en onAuthStateChanged:", error);
      } finally {
        if (!initializedOnceRef.current) {
          initializedOnceRef.current = true;
          dispatch(setInitialized(true));
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
};

export default AuthListener;
