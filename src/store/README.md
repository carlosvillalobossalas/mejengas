# Redux Toolkit - Sistema de Autenticación

## Estructura

```
src/
├── store/
│   ├── store.js              # Configuración del store de Redux
│   └── slices/
│       └── authSlice.js      # Slice de autenticación
├── hooks/
│   └── useAuthRedux.js       # Hook personalizado para autenticación
```

## Uso

### 1. Hook useAuth (Recomendado)

El hook `useAuth` proporciona acceso completo al estado de autenticación:

```javascript
import { useAuth } from '../hooks/useAuthRedux';

function MyComponent() {
  const { user, userData, isAuthenticated, loading, error, isAdmin } = useAuth();
  
  if (loading) return <CircularProgress />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return (
    <div>
      <h1>Hola {user.displayName}</h1>
      {isAdmin && <p>Eres administrador</p>}
    </div>
  );
}
```

### 2. Dispatch de acciones

Para login y logout usa las acciones del slice:

```javascript
import { useDispatch } from 'react-redux';
import { loginWithGoogle, logout } from '../store/slices/authSlice';

function LoginButton() {
  const dispatch = useDispatch();
  
  const handleLogin = async () => {
    try {
      await dispatch(loginWithGoogle()).unwrap();
      // Login exitoso
    } catch (error) {
      // Manejar error
    }
  };
  
  const handleLogout = async () => {
    await dispatch(logout()).unwrap();
  };
  
  return <button onClick={handleLogin}>Login con Google</button>;
}
```

### 3. Selectores directos

Si solo necesitas un valor específico:

```javascript
import { useSelector } from 'react-redux';
import { selectIsAdmin, selectUser } from '../store/slices/authSlice';

function AdminPanel() {
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectUser);
  
  if (!isAdmin) return null;
  
  return <div>Panel de Admin</div>;
}
```

## Estado del Auth Slice

```javascript
{
  user: {
    uid: string,
    email: string,
    displayName: string,
    photoURL: string
  },
  userData: {
    role: 'user' | 'admin',
    createdAt: Timestamp,
    updatedAt: Timestamp,
    // ... otros campos de Firestore
  },
  loading: boolean,
  error: string | null,
  isAuthenticated: boolean
}
```

## Acciones disponibles

- `loginWithGoogle()` - Login con Google OAuth
- `logout()` - Cerrar sesión
- `fetchUserData(uid)` - Obtener datos del usuario de Firestore
- `setUser(user)` - Actualizar usuario (uso interno)
- `setUserData(data)` - Actualizar datos adicionales
- `clearError()` - Limpiar errores

## Sincronización con Firebase

El hook `useAuth` mantiene sincronizado el estado de Redux con Firebase Auth mediante `onAuthStateChanged`. No necesitas hacer nada manualmente, el sistema se encarga de:

1. Detectar cuando el usuario hace login
2. Obtener datos adicionales de Firestore
3. Actualizar el store de Redux
4. Detectar cuando el usuario hace logout
5. Limpiar el estado

## Migrando código existente

**Antes (con react-firebase-hooks):**
```javascript
const [user, loading] = useAuthState(auth);
const { isAdmin } = useAdmin(user);
```

**Después (con Redux):**
```javascript
const { user, loading, isAdmin } = useAuth();
```
