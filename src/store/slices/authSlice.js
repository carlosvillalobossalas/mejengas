import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const sanitizeFirestoreValue = (value) => {
  if (!value) return value;

  // Firestore Timestamp
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeFirestoreValue);
  }

  if (typeof value === 'object') {
    const result = {};
    for (const [key, nested] of Object.entries(value)) {
      result[key] = sanitizeFirestoreValue(nested);
    }
    return result;
  }

  return value;
};

// ==================== ASYNC THUNKS ====================

// Login con Google
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Crear o actualizar usuario en Firestore
      await createOrUpdateUserInFirestore(user);

      // Obtener datos del usuario desde Firestore
      const userData = await getUserDataFromFirestore(user.uid);

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        ...userData,
      };
    } catch (error) {
      console.error('Error en login:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await firebaseSignOut(auth);
      return null;
    } catch (error) {
      console.error('Error en logout:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Obtener datos del usuario desde Firestore
export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (uid, { rejectWithValue }) => {
    try {
      const userData = await getUserDataFromFirestore(uid);
      return sanitizeFirestoreValue(userData);
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return rejectWithValue(error.message);
    }
  }
);

// ==================== FUNCIONES AUXILIARES ====================

// Crear o actualizar usuario en Firestore
const createOrUpdateUserInFirestore = async (user) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Crear nuevo usuario
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      role: 'user', // Por defecto es usuario normal
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    // Actualizar datos básicos si cambiaron
    const updates = {
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, updates, { merge: true });
  }
};

// Obtener datos del usuario desde Firestore
const getUserDataFromFirestore = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? sanitizeFirestoreValue(userDoc.data()) : null;
};

// ==================== SLICE ====================

const initialState = {
  user: null,
  userData: null, // Datos adicionales de Firestore
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (!action.payload) {
        state.userData = null;
      }
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login con Google
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userData = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.userData = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch user data
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, setUserData, setInitialized, clearError } = authSlice.actions;

export default authSlice.reducer;

// Selectores
export const selectUser = (state) => state.auth.user;
export const selectUserData = (state) => state.auth.userData;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAdmin = (state) => state.auth.userData?.role === 'admin';
export const selectAuthInitialized = (state) => state.auth.initialized;
