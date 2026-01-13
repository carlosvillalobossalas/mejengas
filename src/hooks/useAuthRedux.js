import { useDispatch, useSelector } from 'react-redux';
import {
  selectUser,
  selectUserData,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsAdmin,
  selectAuthInitialized,
} from '../store/slices/authSlice';

/**
 * Hook personalizado para gestionar la autenticación con Redux
 * Escucha los cambios en el estado de autenticación de Firebase
 * y sincroniza con el store de Redux
 */
export const useAuth = () => {
  useDispatch();
  const user = useSelector(selectUser);
  const userData = useSelector(selectUserData);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAdmin = useSelector(selectIsAdmin);
  const initialized = useSelector(selectAuthInitialized);

  return {
    user,
    userData,
    isAuthenticated,
    loading,
    error,
    isAdmin,
    initialized,
  };
};
