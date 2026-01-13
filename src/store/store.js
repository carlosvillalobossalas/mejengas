import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar estas acciones porque Firebase devuelve objetos no serializables
        ignoredActions: ['auth/setUser', 'auth/setUserData', 'auth/loginWithGoogle/fulfilled'],
        // Ignorar estos paths en el state - todos los campos de userData pueden tener Timestamps
        ignoredPaths: ['auth.user', 'auth.userData', 'auth.userData.createdAt', 'auth.userData.updatedAt'],
      },
    }),
});
