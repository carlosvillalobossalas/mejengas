import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import {
  setUser,
  fetchUserData,
  selectUser,
  selectUserData,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsAdmin,
} from '../store/slices/authSlice';

/**
 * Hook personalizado para gestionar la autenticación con Redux
 * Escucha los cambios en el estado de autenticación de Firebase
 * y sincroniza con el store de Redux
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userData = useSelector(selectUserData);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAdmin = useSelector(selectIsAdmin);

  useEffect(() => {
    // Listener para cambios en autenticación
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Usuario autenticado
          dispatch(setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }));
          
          // Obtener datos de Firestore (sin snapshot)
          await dispatch(fetchUserData(firebaseUser.uid));
        } else {
          // Usuario no autenticado
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error('Error en onAuthStateChanged:', error);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return {
    user,
    userData,
    isAuthenticated,
    loading,
    error,
    isAdmin,
  };
};
